const userService = require('../services/userService');

/**
 * Validate a rating value (1 to 5 integer)
 */
const isValidRating = (rating) => {
  if (rating === undefined || rating === null) return false;
  if (typeof rating !== 'number') return false;
  if (!Number.isInteger(rating)) return false;
  if (rating < 1 || rating > 5) return false;
  return true;
};

/**
 * Get Stores List for Normal Users
 */
const getStores = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, address, sortBy = 'name', order = 'asc' } = req.query;
    
    const filters = { name, address };
    
    const stores = await userService.getStores(userId, filters, sortBy, order);
    
    res.status(200).json({
      success: true,
      data: {
        stores
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit a New Rating
 */
const submitRating = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const storeId = parseInt(req.params.storeId, 10);
    const { rating } = req.body;

    if (isNaN(storeId)) {
      return res.status(400).json({ success: false, message: 'Invalid store ID' });
    }

    if (!isValidRating(rating)) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5' });
    }

    // Verify store exists
    const storeExists = await userService.checkStoreExists(storeId);
    if (!storeExists) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // Attempt to insert rating
    const newRating = await userService.submitRating(userId, storeId, rating);

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: newRating
    });
  } catch (error) {
    if (error.code === '23505' && error.constraint === 'ratings_user_id_store_id_key') {
      return res.status(409).json({ success: false, message: 'You have already submitted a rating for this store. Use the modify endpoint to update it.' });
    }
    next(error);
  }
};

/**
 * Modify an Existing Rating
 */
const modifyRating = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const storeId = parseInt(req.params.storeId, 10);
    const { rating } = req.body;

    if (isNaN(storeId)) {
      return res.status(400).json({ success: false, message: 'Invalid store ID' });
    }

    if (!isValidRating(rating)) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5' });
    }

    const updatedRating = await userService.modifyRating(userId, storeId, rating);

    if (!updatedRating) {
      return res.status(404).json({ success: false, message: 'You have not submitted a rating for this store yet' });
    }

    res.status(200).json({
      success: true,
      message: 'Rating modified successfully',
      data: updatedRating
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStores,
  submitRating,
  modifyRating
};
