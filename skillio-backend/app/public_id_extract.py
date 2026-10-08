from urllib.parse import urlparse

def extract_cloudinary_details(url: str) -> tuple[str, str, str, str]:
    """
    Extracts the Cloudinary public ID, resource type, format, and delivery type from a standard delivery URL.
    Returns: (public_id, resource_type, format, delivery_type)
    """
    path = urlparse(url).path
    path_parts = path.split('/')
    
    # Defaults
    resource_type = 'image'
    file_format = None
    delivery_type = 'upload'
    
    # e.g., ['', 'cloudname', 'image', 'upload', 'v1234', 'folder', 'file.pdf']
    if len(path_parts) > 3 and path_parts[3] in ['upload', 'authenticated']:
        resource_type = path_parts[2]
        delivery_type = path_parts[3]
        
    # Extract format (extension)
    filename = path_parts[-1]
    if '.' in filename:
        file_format = filename.rsplit('.', 1)[-1]
        
    # Remove the file extension for public_id extraction
    path_without_ext = path.rsplit('.', 1)[0]
    parts_no_ext = path_without_ext.split('/')
    
    # Locate the version tag to isolate the trailing path (public ID)
    for i, part in enumerate(parts_no_ext):
        if part.startswith('v') and part[1:].isdigit():
            return '/'.join(parts_no_ext[i+1:]), resource_type, file_format, delivery_type
            
    # Fallback if the URL omits the version tag
    if 'upload' in parts_no_ext:
        idx = parts_no_ext.index('upload')
        return '/'.join(parts_no_ext[idx+1:]), resource_type, file_format, 'upload'
        
    return parts_no_ext[-1], resource_type, file_format, delivery_type