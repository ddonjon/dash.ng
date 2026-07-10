import { X, AlertTriangle, Loader2 } from 'lucide-react'

export function DeleteConfirmationModal({ isOpen, onClose, onConfirm, propertyTitle, isDeleting }) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-xl transition"
          disabled={isDeleting}
        >
          <X size={18} className="text-gray-400" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle size={32} className="text-red-700" />
          </div>
          
          <h3 className="text-lg font-bold text-gray-900">Delete Listing</h3>
          <p className="text-sm text-gray-500 mt-2">
            Are you sure you want to delete "{propertyTitle}"? 
            This action cannot be undone and will remove all images associated with this listing.
          </p>

          <div className="flex gap-3 w-full mt-6">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-700 hover:bg-red-800 rounded-xl transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                'Yes, Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
