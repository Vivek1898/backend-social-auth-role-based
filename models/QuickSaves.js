const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const quickSaveSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // Add index for better query performance
    },
    content: {
        type: Object, // Changed from JSON to Object
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add text indexes to support search functionality within content
// Note: This assumes that content might contain title and description fields that are searchable
quickSaveSchema.index({ 'content.title': 'text', 'content.description': 'text' });

// Add pagination plugin
quickSaveSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("QuickSave", quickSaveSchema);