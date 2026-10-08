from cloudinary.utils import cloudinary_url
from app.public_id_extract import extract_cloudinary_details
import datetime
from mongoengine.errors import DoesNotExist, NotUniqueError
from app.Model.DocumentBase import DocumentBase
from app.Model.DocumentAccess import DocumentAccess


# ─────────────────────────────────────────────
# DocumentBase CRUD
# ─────────────────────────────────────────────

def createDocument(
    documentName: str,
    uploadedUrl: str,
    insertedBy: str,
    isMainCategory: bool,
    mainCategoryID: str,
    companyAccID: str,
    accessLevel: str,
    documentDescription: str = None,
    subCategoryID: str = None,
    accessEntries: list = None          # optional list of {roleID, permission}
) -> str:
    """
    Create a DocumentBase record, then optionally create DocumentAccess entries.

    accessEntries format: [{"roleID": "<id>", "permission": "manage|read"}, ...]

    Returns the string ID of the created document.
    Raises ValueError for business-rule violations.
    """
    # Business rule: subCategoryID required when isMainCategory is False
    if not isMainCategory and not subCategoryID:
        raise ValueError("subCategoryID is required when isMainCategory is False")

    if accessLevel not in ("public", "restricted", "private"):
        raise ValueError("accessLevel must be 'public', 'restricted', or 'private'")

    newDoc = DocumentBase(
        documentName=documentName,
        documentDescription=documentDescription,
        uploadedUrl=uploadedUrl,
        timestamp=datetime.datetime.utcnow(),
        insertedBy=insertedBy,
        isMainCategory=isMainCategory,
        mainCategoryID=mainCategoryID,
        subCategoryID=subCategoryID if not isMainCategory else None,
        companyAccID=companyAccID,
        accessLevel=accessLevel
    )
    newDoc.save()
    documentBaseID = str(newDoc.id)

    # Insert access entries if provided
    if accessEntries:
        for entry in accessEntries:
            roleID = entry.get("roleID")
            permission = entry.get("permission")
            if not roleID or permission not in ("manage", "read"):
                continue  # skip malformed entries silently
            try:
                accessRecord = DocumentAccess(
                    documentBaseID=documentBaseID,
                    roleID=roleID,
                    companyID=companyAccID,
                    permission=permission
                )
                accessRecord.save()
            except NotUniqueError:
                pass  # duplicate role→document pair; skip

    return documentBaseID


def getAllDocuments(companyAccID: str):
    """Fetch all documents belonging to the company."""
    try:
        documents = DocumentBase.objects(companyAccID=companyAccID)
        for doc in documents:
            url = doc.uploadedUrl
            publicID, resource_type, file_format, delivery_type = extract_cloudinary_details(url=url)
            kwargs = {"type": delivery_type, "sign_url": True, "resource_type": resource_type}
            if file_format:
                kwargs["format"] = file_format
            secure_url, options = cloudinary_url(publicID, **kwargs)
            doc.uploadedUrl = secure_url
        return documents
    except Exception as e:
        raise e


def getDocumentByID(documentID: str, companyAccID: str):
    """Fetch a single document by ID, scoped to the company."""
    try:
        doc = DocumentBase.objects(id=documentID, companyAccID=companyAccID).first()
        if doc:
            url = doc.uploadedUrl
            publicID, resource_type, file_format, delivery_type = extract_cloudinary_details(url=url)
            kwargs = {"type": delivery_type, "sign_url": True, "resource_type": resource_type}
            if file_format:
                kwargs["format"] = file_format
            secure_url, options = cloudinary_url(publicID, **kwargs)
            doc.uploadedUrl = secure_url
        return doc
    except Exception as e:
        raise e


def updateDocument(
    documentID: str,
    companyAccID: str,
    documentName: str,
    isMainCategory: bool,
    mainCategoryID: str,
    accessLevel: str,
    documentDescription: str = None,
    subCategoryID: str = None,
    addingRoles: list = None,
    removingRoles: list = None,
) -> bool:
    """
    Update mutable fields of a DocumentBase document.
    Immutable fields (uploadedUrl, timestamp, insertedBy, companyAccID) are never touched.
    """
    if not isMainCategory and not subCategoryID:
        raise ValueError("subCategoryID is required when isMainCategory is False")

    if accessLevel not in ("public", "restricted", "private"):
        raise ValueError("accessLevel must be 'public', 'restricted', or 'private'")

    doc = DocumentBase.objects(id=documentID, companyAccID=companyAccID).first()
    if not doc:
        return False

    doc.documentName = documentName
    doc.documentDescription = documentDescription
    doc.isMainCategory = isMainCategory
    doc.mainCategoryID = mainCategoryID
    doc.subCategoryID = subCategoryID if not isMainCategory else None
    doc.accessLevel = accessLevel

    addingRoles = addingRoles or []
    removingRoles = removingRoles or []

    #dir parts
    addObj = []
    for a in addingRoles:
        obj = DocumentAccess(
            documentBaseID=documentID,
            roleID=a.get('roleID'),
            companyID=companyAccID,
            permission=a.get('permission')
        )
        addObj.append(obj)
        
    if addObj:
        DocumentAccess.objects.insert(addObj, load_bulk=False, ordered=False)    
        
    if removingRoles:
        DocumentAccess.objects(
            id__in=removingRoles
        ).delete()    
        
    doc.save()
    return True


def deleteDocument(documentID: str, companyAccID: str) -> bool:
    """
    Delete a DocumentBase document and all its DocumentAccess entries.
    """
    doc = DocumentBase.objects(id=documentID, companyAccID=companyAccID).first()
    if not doc:
        return False

    # Cascade: remove all access control entries for this document
    DocumentAccess.objects(documentBaseID=documentID).delete()

    doc.delete()
    return True


# ─────────────────────────────────────────────
# Employee document view
# ─────────────────────────────────────────────

def getDocumentsForEmployee(companyAccID: str, roleID: str) -> list:
    """
    Return documents visible to an employee based on their role.

    Visibility rules:
    - 'public' documents: always visible to all employees of the company.
    - 'restricted' / 'private' documents: only visible when the employee's roleID
      has a DocumentAccess entry for that document.

    Each returned item includes the full document data plus enriched category info:
        "categories": {
            "mainCat": {"name": "<name>", "id": "<id>"},
            "subCat":  {"name": "<name>", "id": "<id>"}  # None when isMainCategory is True
        }
    """
    from app.Model.DocCategory import DocCategory

    # 1. Collect document IDs this role can access (restricted/private)
    access_entries = DocumentAccess.objects(companyID=companyAccID, roleID=roleID)
    accessible_doc_ids = {entry.documentBaseID for entry in access_entries}

    # 2. Fetch all documents for the company
    all_docs = DocumentBase.objects(companyAccID=companyAccID)

    # 3. Build a category lookup cache to avoid repeated DB hits
    category_cache = {}

    def get_category(cat_id: str):
        if not cat_id:
            return None
        if cat_id not in category_cache:
            cat = DocCategory.objects(id=cat_id).first()
            category_cache[cat_id] = cat
        return category_cache[cat_id]

    result = []
    for doc in all_docs:
        doc_id = str(doc.id)

        # Apply visibility filter
        if doc.accessLevel == "public":
            pass  # always include
        elif doc_id in accessible_doc_ids:
            pass  # employee's role has access
        else:
            continue  # no access — skip

        # Resolve category names
        main_cat = get_category(doc.mainCategoryID)
        sub_cat  = get_category(doc.subCategoryID) if not doc.isMainCategory else None
        
        # Sign the URL
        url = doc.uploadedUrl
        publicID, resource_type, file_format, delivery_type = extract_cloudinary_details(url=url)
        kwargs = {"type": delivery_type, "sign_url": True, "resource_type": resource_type}
        if file_format:
            kwargs["format"] = file_format
        secure_url, options = cloudinary_url(publicID, **kwargs)

        result.append({
            "_id":                 doc_id,
            "documentName":        doc.documentName,
            "documentDescription": doc.documentDescription,
            "uploadedUrl":         secure_url,
            "timestamp":           doc.timestamp.isoformat() if doc.timestamp else None,
            "insertedBy":          doc.insertedBy,
            "isMainCategory":      doc.isMainCategory,
            "companyAccID":        doc.companyAccID,
            "accessLevel":         doc.accessLevel,
            "categories": {
                "mainCat": {
                    "name": main_cat.catName if main_cat else None,
                    "id":   str(main_cat.id)  if main_cat else doc.mainCategoryID
                },
                "subCat": {
                    "name": sub_cat.catName if sub_cat else None,
                    "id":   str(sub_cat.id)  if sub_cat else doc.subCategoryID
                } if not doc.isMainCategory else None
            }
        })

    return result
