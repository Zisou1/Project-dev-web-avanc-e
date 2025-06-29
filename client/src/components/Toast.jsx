import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = 'success', isVisible, onClose, duration = 4000 }) => {
	useEffect(() => {
		if (isVisible) {
			const timer = setTimeout(() => {
				onClose();
			}, duration);
			return () => clearTimeout(timer);
		}
	}, [isVisible, onClose, duration]);

	if (!isVisible) return null;

	const getToastStyles = () => {
		switch (type) {
			case 'success':
				return {
					bg: 'bg-gradient-to-r from-green-500 to-green-600',
					icon: (
						<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
						</svg>
					)
				};
			case 'error':
				return {
					bg: 'bg-gradient-to-r from-red-500 to-red-600',
					icon: (
						<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
						</svg>
					)
				};
			case 'warning':
				return {
					bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
					icon: (
						<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
						</svg>
					)
				};
			default:
				return {
					bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
					icon: (
						<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
					)
				};
		}
	};

	const styles = getToastStyles();

	return (
		<div className="fixed top-4 right-4 z-[9999] animate-slideIn">
			<div className={`${styles.bg} text-white px-6 py-4 rounded-2xl shadow-2xl max-w-md w-full border border-white/20 backdrop-blur-sm`}>
				<div className="flex items-start space-x-4">
					<div className="flex-shrink-0 mt-0.5">
						{styles.icon}
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium leading-relaxed">{message}</p>
					</div>
					<button
						onClick={onClose}
						className="flex-shrink-0 ml-4 text-white/80 hover:text-white transition-colors"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
};

export default Toast;
