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
        BlogpostOrdered.sort(function(a, b) {
            return dateToUnix(b.post_date) - dateToUnix(a.post_date);
        });

        return BlogpostOrdered.map(blogpost => {
            return (
                <li className="posts-list-item" key={blogpost.postid}>
                    <Link className="posts-list-item-title" to={`/${BLOG_SEO_SUBFOLDER}/${blogpost.post_folder}/${blogpost.postid}`}>{blogpost.title}</Link>
                    <span className="posts-list-item-description">📅 {dateToNiceString(blogpost.post_date)}</span>
                </li>
            );
        });
    }

    render() {
        return (
            <main className="app-container">
                <HtmlHead title={SITE_TITLE} description={SITE_META_DESCRIPTION} author={SITE_AUTHOR} canonicalUrl={SITE_CANONICAL_URL} />
                <h1>Blog post feed</h1>
                <article>
                    <ul className="posts-list" id="posts-list">{this.renderList()}</ul>
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