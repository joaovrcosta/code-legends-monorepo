"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Check, Gear, Rocket, Info } from "@phosphor-icons/react/dist/ssr";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { getNotifications, type Notification } from "@/actions/notification/get-notifications";
import { getUnreadCount } from "@/actions/notification/get-unread-count";
import { markAsRead } from "@/actions/notification/mark-as-read";
import { markAllAsRead } from "@/actions/notification/mark-all-as-read";

function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    return formatDistanceToNow(date, {
        addSuffix: true,
        locale: ptBR,
    });
}

function getNotificationIcon(type: string) {
    switch (type) {
        case "CERTIFICATE_GENERATED":
        case "COURSE_COMPLETED":
            return <Info size={24} weight="fill" className="text-green-400" />;
        case "LEVEL_UP":
            return <Rocket size={24} weight="fill" className="text-blue-400" />;
        case "NEW_COURSE_AVAILABLE":
        case "NEW_EVENT":
            return <Rocket size={24} className="text-[#00c7fe]" />;
        case "REQUEST_STATUS_CHANGED":
            return <Info size={24} className="text-yellow-400" />;
        default:
            return <Info size={16} className="text-gray-400" />;
    }
}

export function NotificationsSection() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"unread" | "read">("unread");
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const loadNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const [notificationsData, countData] = await Promise.all([
                getNotifications(activeTab === "unread" ? false : true, 50),
                getUnreadCount(),
            ]);
            setNotifications(notificationsData.notifications);
            setUnreadCount(countData.count);
        } catch (error) {
            console.error("Erro ao carregar notificações:", error);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        const loadInitialCount = async () => {
            try {
                const countData = await getUnreadCount();
                setUnreadCount(countData.count);
            } catch (error) {
                console.error("Erro ao carregar contagem inicial:", error);
            }
        };

        loadInitialCount();
    }, []);

    useEffect(() => {
        if (isOpen) {
            loadNotifications();
        }
    }, [isOpen, activeTab, loadNotifications]);

    useEffect(() => {
        if (!isOpen) {
            const interval = setInterval(async () => {
                try {
                    const countData = await getUnreadCount();
                    setUnreadCount(countData.count);
                } catch (error) {
                    console.error("Erro ao atualizar contagem:", error);
                }
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [isOpen]);

    const handleMarkAsRead = async (notificationId: string) => {
        const result = await markAsRead(notificationId);
        if (result.success) {
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notificationId ? { ...n, read: true } : n
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        }
    };

    const handleMarkAllAsRead = async () => {
        const result = await markAllAsRead();
        if (result.success) {
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true }))
            );
            setUnreadCount(0);
        }
    };

    // Fecha o dropdown durante o resize
    useEffect(() => {
        let timeoutRef: NodeJS.Timeout | null = null;

        const handleResize = () => {
            if (isOpen) {
                setIsOpen(false);
            }
        };

        const debouncedHandleResize = () => {
            if (timeoutRef) {
                clearTimeout(timeoutRef);
            }
            timeoutRef = setTimeout(handleResize, 100);
        };

        window.addEventListener("resize", debouncedHandleResize);

        return () => {
            window.removeEventListener("resize", debouncedHandleResize);
            if (timeoutRef) {
                clearTimeout(timeoutRef);
            }
        };
    }, [isOpen]);

    const unreadNotifications = notifications.filter((n) => !n.read);
    const readNotifications = notifications.filter((n) => n.read);
    const displayedNotifications = activeTab === "unread" ? unreadNotifications : readNotifications;

    return (
        <DropdownMenu onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <div className="relative">
                    <div
                        className={`flex items-center space-x-3 border py-2 px-3 rounded-[20px] transition-colors ${isOpen
                            ? "bg-[#25252A] border-[#FFB733]"
                            : "border-[#25252A] hover:bg-[#25252A] hover:border-[#FFB733]"
                            }`}
                    >
                        <Bell size={24} weight="fill" className="text-[#515155]" />
                    </div>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#FFB733] text-[#1A1A1E] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                side="bottom"
                sideOffset={8}
                className="
          w-screen 
          max-w-none 
          left-0 
          right-0 
          rounded-none 
          border-none 
          bg-[#1A1A1E] 
          shadow-2xl 
          z-50
          p-0
          max-h-[600px]
          overflow-hidden
          flex
          flex-col
      
          sm:w-[480px]
          sm:max-w-[480px]
          sm:rounded-[20px] 
          sm:border 
          sm:border-[#25252A] 
          sm:left-auto 
          sm:right-auto
        "
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#25252A]">
                    <h2 className="text-white font-bold text-lg">Notificações</h2>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleMarkAllAsRead}
                            className="flex items-center gap-2 text-[#C4C4CC] hover:text-white transition-colors text-sm"
                        >
                            <Check size={16} weight="bold" />
                            <span>Marcar todas como lidas</span>
                        </button>
                        <button className="text-[#C4C4CC] hover:text-white transition-colors">
                            <Gear size={20} weight="bold" />
                        </button>
                    </div>
                </div>

                <div className="flex border-b border-[#25252A]">
                    <button
                        onClick={() => setActiveTab("unread")}
                        className={`flex-1 py-3 text-center font-medium transition-colors relative ${activeTab === "unread"
                            ? "text-white"
                            : "text-[#8D8D93]"
                            }`}
                    >
                        Não lidas
                        {activeTab === "unread" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-gradient-500" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("read")}
                        className={`flex-1 py-3 text-center font-medium transition-colors relative ${activeTab === "read"
                            ? "text-white"
                            : "text-[#8D8D93]"
                            }`}
                    >
                        Lidas
                        {activeTab === "read" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-gradient-500" />
                        )}
                    </button>
                </div>

                {/* {showBanner && (
                    <div className="bg-[#9333EA] p-4 mx-4 mt-4 rounded-lg relative">
                        <button
                            onClick={() => setShowBanner(false)}
                            className="absolute top-2 right-2 text-white hover:text-gray-200"
                        >
                            <X size={16} weight="bold" />
                        </button>
                    </div>
                )} */}

                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-8 text-center text-[#8D8D93]">
                            Carregando...
                        </div>
                    ) : displayedNotifications.length === 0 ? (
                        <div className="p-8 text-center text-[#8D8D93]">
                            {activeTab === "unread"
                                ? "Nenhuma notificação não lida"
                                : "Nenhuma notificação lida"}
                        </div>
                    ) : (
                        <div className="p-2">
                            {displayedNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-3 py-5 rounded-[16px] mb-2 cursor-pointer transition-colors border border-transparent ${!notification.read
                                        ? "hover:bg-gray-gradient-first transition-all ease-in-out"
                                        : "hover:bg-gray-gradient-first transition-all ease-in-out hover:border-[#25252A]"
                                        }`}
                                    onClick={() => {
                                        if (!notification.read) {
                                            handleMarkAsRead(notification.id);
                                        }
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[#8D8D93] text-xs mb-1">
                                                {formatRelativeTime(notification.createdAt)}
                                            </p>
                                            <p className="text-white text-sm">
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
