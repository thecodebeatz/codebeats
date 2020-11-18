/**
 * @file component used to dynamically update site metadata.
 *
 */

import React from 'react';
import { Helmet } from 'react-helmet';

class HtmlHead extends React.Component {
    render() {
        return (
            <Helmet>
                <title>{this.props.title}</title>
                <meta name="author" content={this.props.author} />
                <link rel="canonical" href={this.props.canonicalUrl} />
                <meta name="description" content={this.props.description} />
                <meta name="twitter:card" content={this.props.description} />
                <meta name="twitter:title" content={this.props.title} />
                <meta name="twitter:description" content={this.props.description} />
                <meta property="og:title" content={this.props.title} />
                <meta property="og:description" content={this.props.description}/>
                <meta property="og:url" content={this.props.canonicalUrl} />
            </Helmet>
        );
    }
}

export default HtmlHead;