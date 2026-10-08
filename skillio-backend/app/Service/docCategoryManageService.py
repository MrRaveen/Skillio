from app.Model.DocCategory import DocCategory
from app.Model.DocumentBase import DocumentBase
from mongoengine.errors import DoesNotExist


def createDocCategory(catName: str, mainOrSub: str, companyID: str, insertedBy: str, mainCatID: str = None) -> bool:
    """
    Create a new document category.
    If mainOrSub is 'sub', mainCatID is required and must reference an existing main category.
    """
    try:
        # Validate that mainCatID references a real main category
        if mainOrSub == "sub":
            parentCat = DocCategory.objects(id=mainCatID, companyID=companyID, mainOrSub="main").first()
            if not parentCat:
                raise ValueError("mainCatID must reference an existing main category within the same company")

        newCategory = DocCategory(
            catName=catName,
            companyID=companyID,
            insertedBy=insertedBy,
            mainOrSub=mainOrSub,
            mainCatID=mainCatID if mainOrSub == "sub" else None
        )
        newCategory.save()
        return True
    except ValueError:
        raise
    except Exception as e:
        raise e


def getAllDocCategories(companyID: str):
    """Fetch all document categories belonging to the company."""
    try:
        return DocCategory.objects(companyID=companyID)
    except Exception as e:
        raise e


def getDocCategoryByID(categoryID: str, companyID: str):
    """Fetch a single document category by ID."""
    try:
        return DocCategory.objects(id=categoryID, companyID=companyID).first()
    except Exception as e:
        raise e


def updateDocCategory(categoryID: str, companyID: str, catName: str, mainOrSub: str, mainCatID: str = None) -> bool:
    """
    Update a document category.

    Business logic:
    - If changing mainOrSub to 'sub': a valid mainCatID (main category) must be provided.
    - If changing mainOrSub to 'main': check whether any sub-categories still reference this
      category as their parent (mainCatID). If yes:
        - They need to be re-parented to the new mainCatID provided (mainCatID becomes the
          replacement parent for the orphaned subs).
        - The current category is then repositioned as sub of mainCatID.
      If no children exist, just update cleanly to 'main' (no mainCatID required).
    - If staying 'main' -> 'main': plain name update.
    - If staying 'sub' -> 'sub': update catName and optionally re-parent (new mainCatID).
    """
    try:
        category = DocCategory.objects(id=categoryID, companyID=companyID).first()
        if not category:
            return False

        previousMainOrSub = category.mainOrSub

        if mainOrSub == "sub":
            # Validate the new parent exists and is a main category in this company
            parentCat = DocCategory.objects(id=mainCatID, companyID=companyID, mainOrSub="main").first()
            if not parentCat:
                raise ValueError("mainCatID must reference an existing main category within the same company")

            category.catName = catName
            category.mainOrSub = "sub"
            category.mainCatID = mainCatID
            category.save()

        elif mainOrSub == "main":
            # Check if children reference this category as their parent
            children = DocCategory.objects(mainCatID=categoryID, companyID=companyID)

            if children.count() > 0:
                # Children exist — they need a new parent
                # The caller must supply a mainCatID that will become the new parent for children
                # AND this category itself becomes sub of that mainCatID
                if not mainCatID:
                    raise ValueError(
                        "This category has sub-categories referencing it. "
                        "Provide a new mainCatID to re-parent them and reposition this category as sub."
                    )

                newParent = DocCategory.objects(id=mainCatID, companyID=companyID, mainOrSub="main").first()
                if not newParent:
                    raise ValueError("The provided mainCatID for re-parenting is not a valid main category")

                # Re-parent all children to the new parent
                children.update(set__mainCatID=mainCatID)

                # Reposition the current category as sub of the new parent
                category.catName = catName
                category.mainOrSub = "sub"
                category.mainCatID = mainCatID
                category.save()
            else:
                # No children — safe to upgrade/keep as main
                category.catName = catName
                category.mainOrSub = "main"
                category.mainCatID = None
                category.save()

        return True
    except ValueError:
        raise
    except Exception as e:
        raise e


def deleteDocCategory(categoryID: str, companyID: str) -> bool:
    """
    Delete a document category and cascade-delete:
    1. All sub-categories that reference this category as their mainCatID.
    2. All DocumentBase documents that reference this category (main or sub).
    3. All DocumentBase documents that reference any of the deleted sub-categories.
    """
    try:
        category = DocCategory.objects(id=categoryID, companyID=companyID).first()
        if not category:
            return False

        # Collect IDs of sub-categories that will also be deleted
        subCategoryIDs = [str(sub.id) for sub in DocCategory.objects(mainCatID=categoryID, companyID=companyID)]

        # Delete DocumentBase docs referencing the sub-categories
        if subCategoryIDs:
            DocumentBase.objects(
                companyAccID=companyID,
                subCategoryID__in=subCategoryIDs
            ).delete()

        # Delete DocumentBase docs referencing this category as main category
        DocumentBase.objects(
            companyAccID=companyID,
            mainCategoryID=categoryID
        ).delete()

        # Delete DocumentBase docs referencing this category as sub category
        DocumentBase.objects(
            companyAccID=companyID,
            subCategoryID=categoryID
        ).delete()

        # Delete all sub-categories
        DocCategory.objects(mainCatID=categoryID, companyID=companyID).delete()

        # Delete the category itself
        category.delete()

        return True
    except Exception as e:
        raise e


def getDocCategoryDetails(companyID: str) -> list:
    """
    Return a hierarchical representation of document categories for a company.
    Format:
    [
        {
            "mainCategory": {"name": "...", "id": "..."},
            "subCategories": [
                {"name": "...", "id": "..."},
                ...
            ]
        },
        ...
    ]
    """
    try:
        main_cats = DocCategory.objects(companyID=companyID, mainOrSub="main")
        sub_cats = DocCategory.objects(companyID=companyID, mainOrSub="sub")

        from collections import defaultdict
        subs_by_main = defaultdict(list)
        for sub in sub_cats:
            if sub.mainCatID:
                subs_by_main[sub.mainCatID].append({
                    "name": sub.catName,
                    "id": str(sub.id)
                })

        result = []
        for main in main_cats:
            main_id_str = str(main.id)
            result.append({
                "mainCategory": {
                    "name": main.catName,
                    "id": main_id_str
                },
                "subCategories": subs_by_main.get(main_id_str, [])
            })
            
        return result
    except Exception as e:
        raise e
