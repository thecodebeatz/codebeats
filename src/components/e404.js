import React from 'react';
import HtmlHead from './HtmlHead';
import { 
    SITE_META_DESCRIPTION,
    SITE_AUTHOR,
    SITE_TITLE } from '../config.js';

const E404 = () => {
    return (
        <main class="app-container">
            <HtmlHead title={"Page not found - "+SITE_TITLE} description={SITE_META_DESCRIPTION} author={SITE_AUTHOR} canonicalUrl="" />
            <h1>404 error</h1>
        </main>
    );    
}

export default E404;