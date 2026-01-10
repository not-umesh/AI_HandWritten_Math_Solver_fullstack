"""
Gemini Handler - Google Gemini Vision API (Free Tier Optimized)
- Smaller images to reduce token usage
- Rate limiting
- Retry with backoff
- Use gemini-1.5-flash (better free tier support)
"""

import os
import gc
import time

class GeminiHandler:
    def __init__(self):
        self.api_key = os.environ.get('GEMINI_API_KEY', '')
        self.model = None
        self.last_request_time = 0
        self.min_request_interval = 2  # Min 2 seconds between requests
        
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                # Use gemini-1.5-flash - better free tier quota
                self.model = genai.GenerativeModel('gemini-1.5-flash')
            except Exception as e:
                print(f"Gemini init error: {e}")
    
    def _rate_limit(self):
        """Ensure minimum time between API calls"""
        elapsed = time.time() - self.last_request_time
        if elapsed < self.min_request_interval:
            time.sleep(self.min_request_interval - elapsed)
        self.last_request_time = time.time()
    
    def extract_equation(self, image_bytes):
        if not self.model:
            return {
                'success': False,
                'error': 'Gemini API not configured. Please check GEMINI_API_KEY.',
                'equation': ''
            }
        
        try:
            from PIL import Image
            from io import BytesIO
            
            # Rate limit to avoid quota exhaustion
            self._rate_limit()
            
            # Create buffer and load image
            buffer = BytesIO(image_bytes)
            buffer.seek(0)
            image = Image.open(buffer)
            image.load()
            
            # AGGRESSIVE resize to minimize tokens (max 512px)
            max_size = 512
            if image.width > max_size or image.height > max_size:
                ratio = min(max_size / image.width, max_size / image.height)
                new_size = (int(image.width * ratio), int(image.height * ratio))
                image = image.resize(new_size, Image.Resampling.LANCZOS)
            
            # Convert to RGB
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Compress image to JPEG with lower quality to reduce size
            jpeg_buffer = BytesIO()
            image.save(jpeg_buffer, format='JPEG', quality=70, optimize=True)
            jpeg_buffer.seek(0)
            compressed_image = Image.open(jpeg_buffer)
            
            # Short, efficient prompt
            prompt = "Extract the math equation. Return ONLY the equation, nothing else."
            
            # Make API call with retry
            response = None
            max_retries = 2
            
            for attempt in range(max_retries):
                try:
                    response = self.model.generate_content([prompt, compressed_image])
                    break
                except Exception as api_error:
                    error_str = str(api_error)
                    if '429' in error_str and attempt < max_retries - 1:
                        # Rate limited - wait and retry
                        time.sleep(15)
                        continue
                    raise api_error
            
            # Clean up
            buffer.close()
            jpeg_buffer.close()
            del image
            del compressed_image
            gc.collect()
            
            if response and response.text:
                equation = response.text.strip()
                equation = equation.replace('```', '').replace('math', '').strip()
                return {
                    'success': True,
                    'equation': equation
                }
            else:
                return {
                    'success': False,
                    'error': 'No equation detected in image',
                    'equation': ''
                }
                
        except Exception as e:
            gc.collect()
            error_msg = str(e)
            print(f"Gemini extract error: {error_msg}")
            
            # Provide helpful error for quota issues
            if '429' in error_msg:
                return {
                    'success': False,
                    'error': 'API rate limit reached. Please wait a moment and try again.',
                    'equation': ''
                }
            
            return {
                'success': False,
                'error': error_msg,
                'equation': ''
            }