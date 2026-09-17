import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { ToastProvider } from './components/ui';
import { restoreSession } from './lib/api';
import { queryClient } from './lib/queryClient';
import './styles/global.css';
import './app/App.css';

async function bootstrap() {
	const useMocks = import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS !== 'false';
	if (useMocks) {
		const { worker } = await import('./mocks/browser');
		await worker.start({ onUnhandledRequest: 'bypass' });
	}
	await restoreSession();
	ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><QueryClientProvider client={queryClient}><ToastProvider><App /></ToastProvider></QueryClientProvider></React.StrictMode>);
}

void bootstrap();
