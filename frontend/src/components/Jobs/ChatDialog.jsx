import React from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import ChatPanel from './ChatPanel';

const ChatDialog = ({ conversation, recipientId, jobId, isOpen, onClose }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full h-[100dvh] sm:h-[600px] sm:max-w-md p-0 gap-0 sm:rounded-xl overflow-hidden border-none bg-transparent shadow-none">
                {/* 
                    We use a slightly modified container for the dialog version 
                    to ensure it fits nicely. The ChatPanel itself has a border and background.
                 */}
                <div className="h-full w-full">
                    <ChatPanel
                        conversation={conversation}
                        recipientId={recipientId}
                        jobId={jobId}
                        onClose={onClose}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ChatDialog;
