import React from 'react';
import {BrowserRouter, Route } from 'react-router-dom';
import Header from './Header'
import Blogfeed from './Blogfeed'
import Blogpost from './Blogpost'

const App = () => {
    return (
        <div className="ui container">
            <BrowserRouter>
                <div>
                    <Header />
                    <Route path="/" exact  component={Blogfeed} />
                    <Route path="/blogpost/*/:blogpostid" component={Blogpost} />
                </div>
            </BrowserRouter>
        </div>
    )
}

export default App;