import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store/store';
import { App } from './routes/App';
import 'react-toastify/dist/ReactToastify.css';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './styles/theme.css';
import 'primeflex/primeflex.css';


ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<Provider store={store}>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</Provider>
	</React.StrictMode>
);


// nagarajud2122_db_user
// zgbFpRFCyVB5Prgz
// mongodb+srv://nagarajud2122_db_user:zgbFpRFCyVB5Prgz@cluster0.gyxreb3.mongodb.net/?appName=Cluster0