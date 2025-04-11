const OCR_API_KEY = import.meta.env.VITE_OCR_API_KEY;

export const validateReceipt = async (imageData, orNumber) => {
  try {
    // The imageData should already be in format: data:image/jpeg;base64,/9j/4AAQ...
    // No need to modify the base64 string as it comes correctly from the ImageUpload component
    
    // Create form data
    const formData = new FormData();
    formData.append('apikey', OCR_API_KEY);
    formData.append('base64Image', imageData); // Send the complete base64 string
    formData.append('language', 'eng');
    formData.append('OCREngine', '2'); // More accurate engine
    formData.append('filetype', 'JPG'); // Explicitly specify file type
    
    // Call OCR.space API
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.OCRExitCode !== 1) {
      console.error('OCR Error:', data);
      throw new Error(data.ErrorMessage?.[0] || 'Failed to process image');
    }

    if (!data.ParsedResults || data.ParsedResults.length === 0) {
      throw new Error('Failed to extract text from image');
    }

    // Extract receipt number from OCR text
    const ocrText = data.ParsedResults[0].ParsedText.toLowerCase();
    const providedOR = orNumber.toLowerCase();

    // Check if the provided OR number exists in the OCR text
    const isValidReceipt = ocrText.includes(providedOR);

    return {
      isValid: isValidReceipt,
      confidence: data.ParsedResults[0].TextOverlay?.Lines?.length > 0 ? 1 : 0,
      ocrText: data.ParsedResults[0].ParsedText
    };
  } catch (error) {
    console.error('Error validating receipt:', error);
    throw new Error(error.message || 'Failed to validate receipt');
  }
}; 