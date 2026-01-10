"""
Gemini Handler - Google Gemini Vision API (Memory Optimized)
"""

import os
import gc
import base64

class GeminiHandler:
    def __init__(self):
        self.api_key = os.environ.get('GEMINI_API_KEY', '')
        self.model = None
        
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-2.0-flash')
            except Exception as e:
                print(f"Gemini init error: {e}")
    
    def extract_equation(self, image_bytes):
        if not self.model:
            return {
                'success': False,
                'error': 'Gemini API not configured',
                'equation': ''
            }
        
        try:
            from PIL import Image
            from io import BytesIO
            
            # Create a fresh BytesIO object and ensure it's at the start
            buffer = BytesIO(image_bytes)
            buffer.seek(0)
            
            # Open image
            image = Image.open(buffer)
            image.load()  # Force load the image data
            
            # Resize large images to max 800px to save memory
            max_size = 800
            if image.width > max_size or image.height > max_size:
                ratio = min(max_size / image.width, max_size / image.height)
                new_size = (int(image.width * ratio), int(image.height * ratio))
                image = image.resize(new_size, Image.Resampling.LANCZOS)
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            prompt = """Extract the mathematical equation from this handwritten image.
Return ONLY the equation using standard notation (+, -, *, /, =, ^, sqrt).
Use x, y, z for variables. No explanation, just the equation."""
            
            response = self.model.generate_content([prompt, image])
            
            # Clean up
            buffer.close()
            del image
            del buffer
            gc.collect()
            
            if response.text:
                equation = response.text.strip()
                equation = equation.replace('```', '').strip()
                return {
                    'success': True,
                    'equation': equation
                }
            else:
                return {
                    'success': False,
                    'error': 'No equation detected',
                    'equation': ''
                }
                
        except Exception as e:
            gc.collect()
            error_msg = str(e)
            print(f"Gemini extract error: {error_msg}")
            return {
                'success': False,
                'error': error_msg,
                'equation': ''
            }