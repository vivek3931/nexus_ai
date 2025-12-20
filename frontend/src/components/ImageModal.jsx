import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink } from 'lucide-react'

export default function ImageModal({ image, onClose }) {
    if (!image) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.92)',
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '24px',
                    cursor: 'pointer'
                }}
            >
                {/* Close button */}
                <motion.button
                    onClick={onClose}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    style={{
                        position: 'absolute',
                        top: '24px',
                        right: '24px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '9999px',
                        padding: '12px',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                >
                    <X size={22} />
                </motion.button>

                {/* Image container */}
                <motion.div
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{
                        type: 'spring',
                        stiffness: 350,
                        damping: 30
                    }}
                    style={{
                        maxWidth: '88vw',
                        maxHeight: '85vh',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'default'
                    }}
                >
                    {/* Image */}
                    <motion.img
                        src={image.url}
                        alt={image.title}
                        initial={{ filter: 'blur(12px)' }}
                        animate={{ filter: 'blur(0px)' }}
                        transition={{ duration: 0.35 }}
                        style={{
                            maxWidth: '100%',
                            maxHeight: 'calc(85vh - 72px)',
                            objectFit: 'contain',
                            borderRadius: '16px',
                            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)'
                        }}
                        onError={(e) => {
                            e.target.src = 'https://placehold.co/800x600/27272a/fbbf24?text=Image'
                        }}
                    />

                    {/* Info bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{
                            marginTop: '16px',
                            padding: '14px 20px',
                            background: 'var(--bg-secondary)',
                            borderRadius: '9999px',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '16px'
                        }}
                    >
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                color: 'var(--text-primary)',
                                fontWeight: 500,
                                fontSize: '14px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {image.title}
                            </div>
                        </div>

                        <a
                            href={image.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                background: 'linear-gradient(135deg, var(--amber-400), var(--amber-500))',
                                borderRadius: '9999px',
                                color: '#000',
                                textDecoration: 'none',
                                fontSize: '13px',
                                fontWeight: 600,
                                transition: 'all 0.2s',
                                flexShrink: 0
                            }}
                        >
                            <ExternalLink size={14} />
                            Open
                        </a>
                    </motion.div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
