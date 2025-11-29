import React from 'react';
import { X } from 'lucide-react';
import { Node as FlowNode, Edge } from 'reactflow';

interface EditModalProps {
  editingNode: FlowNode | null;
  editingEdge: Edge | null;
  editForm: any;
  editEdgeLabel: string;
  onClose: () => void;
  onSave: () => void;
  setEditForm: (form: any) => void;
  setEditEdgeLabel: (label: string) => void;
}

const EditModal: React.FC<EditModalProps> = ({
  editingNode,
  editingEdge,
  editForm,
  editEdgeLabel,
  onClose,
  onSave,
  setEditForm,
  setEditEdgeLabel
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-sans">
        <div 
            className="w-full max-w-md bg-white dark:bg-[#181818] rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
                    {editingNode ? (editingNode.type === 'note' ? 'Edit Note' : 'Edit Component') : 'Edit Connection'}
                </h3>
                <button onClick={onClose} className="p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
                    <X size={18} />
                </button>
            </div>
            
            <div className="p-6 space-y-5">
                {editingNode ? (
                    editingNode.type === 'note' ? (
                        <>
                            <div>
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Note Text</label>
                                <textarea 
                                    value={editForm.label}
                                    onChange={(e) => setEditForm({...editForm, label: e.target.value})}
                                    className="w-full px-3 py-2 bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-md text-sm focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 outline-none transition-all resize-none h-32 placeholder:text-zinc-400"
                                    placeholder="Enter note text..."
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Color</label>
                                <div className="flex gap-3">
                                    {[
                                        { id: 'black', label: 'Default', bg: 'bg-zinc-900' },
                                        { id: 'blue', label: 'Blue', bg: 'bg-blue-600' },
                                        { id: 'red', label: 'Red', bg: 'bg-red-600' }
                                    ].map(opt => (
                                        <label key={opt.id} className="group relative flex items-center justify-center cursor-pointer p-1">
                                            <input 
                                                type="radio" 
                                                name="noteColor" 
                                                value={opt.id}
                                                checked={editForm.color === opt.id}
                                                onChange={() => setEditForm({...editForm, color: opt.id as any})} 
                                                className="hidden" 
                                            />
                                            <div className={`w-8 h-8 rounded-full ${opt.bg} transition-transform ${editForm.color === opt.id ? 'scale-110' : 'scale-100 opacity-80 group-hover:opacity-100'}`}></div>
                                            {editForm.color === opt.id && <div className="absolute inset-0 rounded-full ring-2 ring-offset-2 ring-zinc-900 dark:ring-zinc-100 ring-offset-white dark:ring-offset-[#181818]"></div>}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Label</label>
                                <input 
                                    value={editForm.label}
                                    onChange={(e) => setEditForm({...editForm, label: e.target.value})}
                                    className="w-full px-3 py-2 bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-md text-sm focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 outline-none transition-all placeholder:text-zinc-400"
                                    placeholder="Component Name"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Description</label>
                                <textarea 
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                    className="w-full px-3 py-2 bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-md text-sm focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 outline-none transition-all resize-none h-24 placeholder:text-zinc-400"
                                    placeholder="Brief description..."
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Icon (Lucide Name)</label>
                                <input 
                                    value={editForm.icon}
                                    onChange={(e) => setEditForm({...editForm, icon: e.target.value})}
                                    className="w-full px-3 py-2 bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-md text-sm focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 outline-none transition-all placeholder:text-zinc-400"
                                    placeholder="e.g. Database, Server, User..."
                                />
                            </div>
                        </>
                    )
                ) : (
                    <div>
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Connection Label</label>
                        <input 
                            value={editEdgeLabel}
                            onChange={(e) => setEditEdgeLabel(e.target.value)}
                            className="w-full px-3 py-2 bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-md text-sm focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 outline-none transition-all placeholder:text-zinc-400"
                            placeholder="e.g. JSON/HTTPS"
                            autoFocus
                        />
                    </div>
                )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30">
                <button 
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={onSave}
                    className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-md hover:opacity-90 transition-opacity shadow-sm"
                >
                    Save Changes
                </button>
            </div>
        </div>
    </div>
  );
};

export default EditModal;