"""
OCR Handler - Tesseract integration for text extraction
"""

import pytesseract
from PIL import Image
import re
import cv2
import numpy as np

class OCRHandler:
    def __init__(self):
        # Tesseract configuration for math equations
        self.config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789+-*/=()^√πxyzabcXYZABC.,<>≤≥²³'
    
    def extract_text(self, image):
        """
        Extract text from preprocessed image using Tesseract
        """
        try:
            # Convert PIL Image to numpy array if needed
            if isinstance(image, Image.Image):
                image_np = np.array(image)
            else:
                image_np = image
            
            # Apply additional preprocessing for better OCR
            processed = self._enhance_for_ocr(image_np)
            
            # Run Tesseract OCR
            text = pytesseract.image_to_string(processed, config=self.config)
            
            return text.strip()
        
        except Exception as e:
            print(f"Tesseract OCR Error: {e}")
            return ""
    
    def _enhance_for_ocr(self, image):
        """Enhance image for better OCR results"""
        try:
            # Convert to grayscale if needed
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
            else:
                gray = image
            
            # Apply bilateral filter to reduce noise while keeping edges sharp
            denoised = cv2.bilateralFilter(gray, 9, 75, 75)
            
            # Apply adaptive thresholding
            binary = cv2.adaptiveThreshold(
                denoised, 255, 
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                cv2.THRESH_BINARY, 11, 2
            )
            
            # Invert if needed (text should be black on white)
            if np.mean(binary) < 127:
                binary = cv2.bitwise_not(binary)
            
            return binary
        
        except Exception as e:
            print(f"Image enhancement error: {e}")
            return image
    
    def clean_equation(self, text):
        """
        Clean and normalize extracted equation text
        """
        if not text:
            return ""
        
        # Common OCR mistakes mapping
        replacements = {
            'O': '0', 'o': '0', 'Q': '0',
            'l': '1', 'I': '1', '|': '1',
            'S': '5', 's': '5',
            'B': '8',
            'Z': '2', 'z': '2',
            'G': '6', 'g': '9',
            '×': '*', '÷': '/', '−': '-',
            '—': '-', '–': '-',
            '^': '**',
            '²': '**2', '³': '**3',
            '√': 'sqrt',
            'π': 'pi',
            '\n': ' ', '\t': ' ',
            '（': '(', '）': ')',
            '［': '[', '］': ']',
        }
        
        result = text
        for old, new in replacements.items():
            result = result.replace(old, new)
        
        # Fix common patterns
        # Add multiplication between number and variable: 2x -> 2*x
        result = re.sub(r'(\d)([a-zA-Z])', r'\1*\2', result)
        
        # Add multiplication between variable and number: x2 -> x*2 (but not for exponents)
        result = re.sub(r'([a-zA-Z])(\d)(?!\*)', r'\1*\2', result)
        
        # Add multiplication between closing and opening parens: )(  -> )*(
        result = re.sub(r'\)\s*\(', r')*(', result)
        
        # Add multiplication between number and opening paren: 2( -> 2*(
        result = re.sub(r'(\d)\s*\(', r'\1*(', result)
        
        # Add multiplication between closing paren and number: )2 -> )*2
        result = re.sub(r'\)\s*(\d)', r')*\1', result)
        
        # Remove extra spaces
        result = re.sub(r'\s+', ' ', result).strip()
        
        # Fix equals sign
        result = re.sub(r'[=]+', '=', result)
        
        return result
    
    def identify_equation_type(self, equation):
        """Identify the type of equation"""
        equation_lower = equation.lower()
        
        if 'sqrt' in equation_lower or '√' in equation:
            return 'radical'
        elif '**' in equation or '^' in equation:
            if '**2' in equation or '^2' in equation:
                return 'quadratic'
            return 'exponential'
        elif 'sin' in equation_lower or 'cos' in equation_lower or 'tan' in equation_lower:
            return 'trigonometric'
        elif 'log' in equation_lower or 'ln' in equation_lower:
            return 'logarithmic'
        elif re.search(r'[a-zA-Z]', equation):
            if '=' in equation:
                return 'algebraic_equation'
            return 'algebraic_expression'
        elif '=' in equation:
            return 'arithmetic_equation'
        else:
            return 'arithmetic_expression'