import React from 'react';
import {BrowserRouter, Route } from 'react-router-dom';
import Header from './Header'
import Blogfeed from './Blogfeed'
import Blogpost from './Blogpost'
import E404 from './e404';

const App = () => {
    return (
        <div className="ui container">
            <BrowserRouter>
                <div>
                    <Header />
                    <Route path="/" exact  component={Blogfeed} />
                    <Route path="/blogpost/*/:blogpostid" component={Blogpost} />
                    <Route path="/e404" exact  component={E404} />
                </div>
            </BrowserRouter>
        </div>
    )
}

export default App;