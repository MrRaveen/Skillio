import { AlertCircle, Bell, CheckCircle2, Info, X } from "lucide-react";
import { useState } from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'alert' | 'info' | 'success';
  read: boolean;
}

interface NotificationSectionProps {
  notifications: Notification[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

export default function NotificationSection({ 
  notifications, 
  onMarkAllRead, 
  onClearAll 
}: NotificationSectionProps) {
    const unreadCount = notifications.filter(n => !n.read).length;
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    return (
        <div className="relative">
               <button 
                 className={`relative p-2 rounded-full transition-colors ${isNotificationsOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-100'}`}
                 onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
               >
                 <Bell className="h-5 w-5" />
                 {unreadCount > 0 && (
                   <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white animate-pulse"></span>
                 )}
               </button>

               {isNotificationsOpen && (
                 <>
                   <div className="fixed inset-0 z-30" onClick={() => setIsNotificationsOpen(false)}></div>
                   <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl ring-1 ring-slate-200 border border-slate-100 z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                     <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                       <h3 className="font-semibold text-slate-900">Notifications</h3>
                       <div className="flex gap-3">
                         {unreadCount > 0 && (
                           <button onClick={onMarkAllRead} className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline">
                             Mark all read
                           </button>
                         )}
                         <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-slate-600 md:hidden">
                           <X className="h-4 w-4" />
                         </button>
                       </div>
                     </div>
                     <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                       {notifications.length > 0 ? (
                         <div className="divide-y divide-slate-100">
                           {notifications.map((notification) => (
                             <div key={notification.id} className={`p-4 flex gap-3 hover:bg-slate-50 transition-colors ${!notification.read ? 'bg-slate-50/60' : ''}`}>
                               <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                                 notification.type === 'alert' ? 'bg-red-100 text-red-600' :
                                 notification.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                 'bg-blue-100 text-blue-600'
                               }`}>
                                 {notification.type === 'alert' && <AlertCircle className="h-4 w-4" />}
                                 {notification.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                                 {notification.type === 'info' && <Info className="h-4 w-4" />}
                               </div>
                               <div className="flex-1 min-w-0">
                                 <p className={`text-sm font-medium ${!notification.read ? 'text-slate-900' : 'text-slate-600'}`}>
                                   {notification.title}
                                 </p>
                                 <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notification.message}</p>
                                 <p className="text-[10px] text-slate-400 mt-1.5">{notification.time}</p>
                               </div>
                               {!notification.read && (
                                 <div className="h-2 w-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
                               )}
                             </div>
                           ))}
                         </div>
                       ) : (
                         <div className="p-8 text-center">
                           <div className="mx-auto h-12 w-12 text-slate-300 flex items-center justify-center rounded-full bg-slate-50 mb-3">
                             <Bell className="h-6 w-6" />
                           </div>
                           <p className="text-sm text-slate-500">No notifications yet</p>
                         </div>
                       )}
                     </div>
                     {notifications.length > 0 && (
                       <div className="p-2 border-t border-slate-100 bg-slate-50/50 text-center">
                         <button onClick={onClearAll} className="text-xs text-slate-500 hover:text-slate-800 font-medium py-1">
                           Clear all notifications
                         </button>
                       </div>
                     )}
                   </div>
                 </>
               )}
             </div>
    );
}
