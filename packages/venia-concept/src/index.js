import React from 'react';
import ReactDOM from 'react-dom';
import { setContext } from 'apollo-link-context';
import { Util } from '@magento/peregrine';

import { Adapter } from 'src/drivers';
import store from 'src/store';
import app from 'src/actions/app';
import App from 'src/components/App';
import './index.css';

const { BrowserPersistence } = Util;
const apiBase = new URL('/graphql', location.origin).toString();

/**
 * The Venia adapter provides basic context objects: a router, a store, a
 * GraphQL client, and some common functions. It is not opinionated about auth,
 * so we add an auth implementation here and prepend it to the Apollo Link list.
 */
const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const storage = new BrowserPersistence();
    // TODO: Get correct token expire time from API
    const token = storage.getItem('signin_token');

    // return the headers to the context so httpLink can read them
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : ''
        }
    };
});

ReactDOM.render(
    <Adapter
        apiBase={apiBase}
        apollo={{ link: authLink.concat(Adapter.apolloLink(apiBase)) }}
        store={store}
    >
        <App />
    </Adapter>,
    document.getElementById('root')
);

window.addEventListener('online', () => {
    store.dispatch(app.setOnline());
});
window.addEventListener('offline', () => {
    store.dispatch(app.setOffline());
});
