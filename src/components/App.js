/**
 * @file contains main application component.
 * 
 * Blog post header/sidebar always shown. Content shown can edither be blog post feed or a single blog post.
 * Connection to Google Tag Manager is made.
 * 
 */
import React from 'react';
import {BrowserRouter, Route } from 'react-router-dom';
import Header from './Header'
import Blogfeed from './Blogfeed'
import Blogpost from './Blogpost'
import E404 from './e404';
import TagManager from 'react-gtm-module'
import { GOOGLE_TAG_MANAGER_ID } from '../config.js';

const tagManagerArgs = {
    gtmId: GOOGLE_TAG_MANAGER_ID
}

TagManager.initialize(tagManagerArgs)

const App = () => {
    return (
        <div id="rootcontainer">
            <BrowserRouter>
                <div>
                    <Header />
                    <Route path="/" exact  component={Blogfeed} />
                    <Route path="/blogpost/:post_folder" component={Blogpost} />
                    <Route path="/e404" exact  component={E404} />
                </div>
            </BrowserRouter>
        </div>
    )
}

export default App;