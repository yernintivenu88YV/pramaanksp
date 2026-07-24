import os
import logging
from fastapi import HTTPException, status

logger = logging.getLogger("appsail.llm_client")

# Centralized configuration
GEMINI_MODEL_ID = "gemini-1.5-flash"

def get_gemini_client():
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        logger.error("GEMINI_API_KEY environment variable is not set.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini API key is not configured on the server."
        )
    
    try:
        import google.generativeai as genai
        genai.configure(api_key=gemini_key)
        return genai
    except ImportError:
        logger.error("google-generativeai package is not installed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI dependencies are missing."
        )

def generate_response(system_prompt: str, user_prompt: str) -> str:
    """
    Centralized function to call Gemini API and handle exceptions cleanly.
    """
    genai = get_gemini_client()
    try:
        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL_ID,
            system_instruction=system_prompt
        )
        response = model.generate_content(user_prompt)
        return response.text
    except Exception as e:
        error_msg = str(e).lower()
        logger.error(f"Gemini API Error: {error_msg}")
        
        if "quota" in error_msg or "429" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="AI quota exceeded. Please try again later."
            )
        elif "api_key" in error_msg or "invalid" in error_msg and "key" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Invalid Gemini API key configured."
            )
        elif "timeout" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="AI service timed out."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"AI service failed: {str(e)}"
            )
