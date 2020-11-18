/**
 * @file contains blog feed component.
 * 
 * Blog post feed is shown. Blog post list and data taken from blogfeed reducer.
 * Uses HtmlHead component to load SEO metadata into <meta> tag.
 * 
 */
import React from 'react';
import { connect } from 'react-redux';
import { fetchBlogPosts } from '../actions';
import { Link } from 'react-router-dom';
import { dateToNiceString, dateToUnix } from '../utils';
import HtmlHead from './HtmlHead';
import { 
    SITE_META_DESCRIPTION, 
    SITE_TITLE,
    SITE_CANONICAL_URL,
    SITE_AUTHOR,
    BLOG_SEO_SUBFOLDER,
    BLOG_TITLE } from '../config.js';

class Blogfeed extends React.Component {

    componentDidMount() {
        this.props.fetchBlogPosts();
    }

    renderList() {

        let BlogpostOrdered = this.props.blogfeed;

        // Order blog pots by publication date, desc order.
        BlogpostOrdered.sort(function(a, b) {
            return dateToUnix(b.post_date) - dateToUnix(a.post_date);
        });

        return BlogpostOrdered.map(blogpost => {
            return ( 
                    
                        <div className="card-grid-space" key={blogpost.post_folder}>
                            <Link className="card" to={`/${BLOG_SEO_SUBFOLDER}/${blogpost.post_folder}`} style={{"--bg-img": `url(${blogpost.image})`}}>
                                <div>
                                    <h2>{blogpost.title}</h2>
                                    <p>{blogpost.summary}</p>
                                    <div className="date">📅 {dateToNiceString(blogpost.post_date)}</div>
                                    {
                                    // TODO: Need to fix styling for tags.
                                    /*                                    
                                    <div className="tags">
                                        {blogpost.post_tags.split(",").map(tag => <div className="tag">{tag}</div>)}
                                    </div> */
                                    }
                                </div>
                            </Link>
                        </div>
                );
        });
    }

    render() {
        return (
            <main className="app-container">
                <HtmlHead title={SITE_TITLE} description={SITE_META_DESCRIPTION} author={SITE_AUTHOR} canonicalUrl={SITE_CANONICAL_URL} />
                <h1>{BLOG_TITLE} blog post feed</h1>
                <article>
                <section className="cards-wrapper">{this.renderList()}</section>
                </article>
            </main>
        );
    }
}

const mapStateToProps = (state) => {
    return { 
        blogfeed: Object.values(state.blogfeed)
    }
}

export default connect(mapStateToProps, {fetchBlogPosts})(Blogfeed);