"""
AI Handler - Multi-provider support (OpenRouter, Gemini)
Tries OpenRouter first (free Llama 3.2 Vision), falls back to Gemini
"""

import os
import gc
import time
import base64
import requests

class AIHandler:
    def __init__(self):
        # OpenRouter (free tier with Llama Vision)
        self.openrouter_key = os.environ.get('OPENROUTER_API_KEY', '')
        
        # Gemini as fallback
        self.gemini_key = os.environ.get('GEMINI_API_KEY', '')
        self.gemini_model = None
        
        self.last_request_time = 0
        self.min_request_interval = 3  # 3 seconds between requests
        
        # Initialize Gemini if available
        if self.gemini_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_key)
                self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
            except Exception as e:
                print(f"Gemini init error: {e}")
    
    def _rate_limit(self):
        """Rate limiting"""
        elapsed = time.time() - self.last_request_time
        if elapsed < self.min_request_interval:
            time.sleep(self.min_request_interval - elapsed)
        self.last_request_time = time.time()
    
    def _compress_image(self, image_bytes):
        """Compress image to reduce API usage"""
        from PIL import Image
        from io import BytesIO
        
        buffer = BytesIO(image_bytes)
        buffer.seek(0)
        image = Image.open(buffer)
        image.load()
        
        # Resize to max 512px
        max_size = 512
        if image.width > max_size or image.height > max_size:
            ratio = min(max_size / image.width, max_size / image.height)
            new_size = (int(image.width * ratio), int(image.height * ratio))
            image = image.resize(new_size, Image.Resampling.LANCZOS)
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Compress to JPEG
        output = BytesIO()
        image.save(output, format='JPEG', quality=60, optimize=True)
        output.seek(0)
        
        buffer.close()
        del image
        
        return output.read()
    
    def _try_openrouter(self, image_bytes):
        """Try OpenRouter with free Llama 3.2 Vision"""
        if not self.openrouter_key:
            return None
        
        try:
            # Compress and encode image
            compressed = self._compress_image(image_bytes)
            b64_image = base64.b64encode(compressed).decode('utf-8')
            
            headers = {
                'Authorization': f'Bearer {self.openrouter_key}',
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://ai-math-solver.app',
                'X-Title': 'AI Math Solver'
            }
            
            payload = {
                'model': 'meta-llama/llama-3.2-11b-vision-instruct:free',
                'messages': [
                    {
                        'role': 'user',
                        'content': [
                            {
                                'type': 'text',
                                'text': 'Extract the math equation from this image. Return ONLY the equation, nothing else.'
                            },
                            {
                                'type': 'image_url',
                                'image_url': {
                                    'url': f'data:image/jpeg;base64,{b64_image}'
                                }
                            }
                        ]
                    }
                ],
                'max_tokens': 100
            }
            
            response = requests.post(
                'https://openrouter.ai/api/v1/chat/completions',
                headers=headers,
                json=payload,
                timeout=30
            )
            
            del compressed
            gc.collect()
            
            if response.status_code == 200:
                data = response.json()
                equation = data['choices'][0]['message']['content'].strip()
                equation = equation.replace('```', '').strip()
                return {'success': True, 'equation': equation, 'provider': 'openrouter'}
            else:
                print(f"OpenRouter error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"OpenRouter error: {e}")
            return None
    
    def _try_gemini(self, image_bytes):
        """Try Gemini Vision"""
        if not self.gemini_model:
            return None
        
        try:
            from PIL import Image
            from io import BytesIO
            
            compressed = self._compress_image(image_bytes)
            image = Image.open(BytesIO(compressed))
            
            prompt = "Extract the math equation. Return ONLY the equation."
            response = self.gemini_model.generate_content([prompt, image])
            
            del image
            gc.collect()
            
            if response.text:
                equation = response.text.strip()
                equation = equation.replace('```', '').strip()
                return {'success': True, 'equation': equation, 'provider': 'gemini'}
            return None
            
        except Exception as e:
            print(f"Gemini error: {e}")
            return None
    
    def extract_equation(self, image_bytes):
        """Extract equation using available providers"""
        self._rate_limit()
        
        # Try OpenRouter first (better free tier)
        result = self._try_openrouter(image_bytes)
        if result:
            return result
        
        # Fallback to Gemini
        result = self._try_gemini(image_bytes)
        if result:
            return result
        
        # Both failed
        gc.collect()
        return {
            'success': False,
            'error': 'Could not process image. Please ensure you have configured OPENROUTER_API_KEY or GEMINI_API_KEY.',
            'equation': ''
        }


# Backward compatibility alias
GeminiHandler = AIHandler