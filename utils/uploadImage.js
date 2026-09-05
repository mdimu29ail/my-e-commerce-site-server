const axios = require('axios');
const FormData = require('form-data');

/**
 * Uploads a file buffer or base64 image to ImgBB
 * @param {Object|Buffer|String} file - Express multer file object (req.file) or base64/buffer
 * @returns {Promise<string|null>} - Returns image URL or null
 */
const uploadImageToImgBB = async file => {
  try {
    if (!file) return null;

    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      throw new Error('IMGBB_API_KEY is not defined in environment variables');
    }

    const formData = new FormData();

    // 1. If passing multer file object (req.file)
    if (file.buffer) {
      formData.append('image', file.buffer.toString('base64'));
    }
    // 2. If passing direct base64 or URL string
    else if (typeof file === 'string') {
      const cleanBase64 = file.replace(/^data:image\/\w+;base64,/, '');
      formData.append('image', cleanBase64);
    } else {
      throw new Error('Invalid file format provided for ImgBB upload');
    }

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    if (response.data && response.data.data && response.data.data.url) {
      return response.data.data.url;
    }

    return null;
  } catch (error) {
    console.error(
      'ImgBB Backend Upload Error:',
      error.response?.data || error.message
    );
    return null;
  }
};

module.exports = { uploadImageToImgBB };
