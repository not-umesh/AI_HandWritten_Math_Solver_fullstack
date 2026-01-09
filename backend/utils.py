"""
Utility functions for image processing and validation
"""

import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance
from io import BytesIO

def preprocess_image(image):
    """
    Preprocess image for better OCR results
    """
    try:
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convert to numpy array
        img_array = np.array(image)
        
        # Convert to grayscale
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # Resize if too small
        height, width = gray.shape
        if height < 100 or width < 100:
            scale = max(100/height, 100/width)
            gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
        
        # Resize if too large (for faster processing)
        height, width = gray.shape
        if height > 1000 or width > 1000:
            scale = min(1000/height, 1000/width)
            gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
        
        # Denoise
        denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
        
        # Increase contrast
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        contrast = clahe.apply(denoised)
        
        # Binarization using Otsu's method
        _, binary = cv2.threshold(contrast, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Invert if text is white on black
        if np.mean(binary) < 127:
            binary = cv2.bitwise_not(binary)
        
        # Remove small noise
        kernel = np.ones((2, 2), np.uint8)
        cleaned = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
        cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_OPEN, kernel)
        
        # Convert back to PIL Image
        result = Image.fromarray(cleaned)
        
        return result
        
    except Exception as e:
        print(f"Preprocessing error: {e}")
        return image

def validate_image(image):
    """
    Validate that the image is suitable for processing
    """
    try:
        # Check if it's a valid image
        if not isinstance(image, Image.Image):
            return False
        
        # Check dimensions
        width, height = image.size
        if width < 10 or height < 10:
            return False
        if width > 10000 or height > 10000:
            return False
        
        return True
        
    except:
        return False

def image_to_base64(image):
    """Convert PIL Image to base64 string"""
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode()

def base64_to_image(base64_string):
    """Convert base64 string to PIL Image"""
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    image_bytes = base64.b64decode(base64_string)
    return Image.open(BytesIO(image_bytes))