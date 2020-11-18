/**
 * @file singular blog post component.
 * 
 * Specific blog post is shown. Blog post list and data taken from blogfeed reducer.
 * Uses HtmlHead component to load SEO metadata into <meta> tag.
 * 
 */
import React from 'react';
import { connect } from 'react-redux';
import { getBlogpostContent } from '../actions';
import { Link, Redirect } from 'react-router-dom';
import { dateToNiceString } from '../utils';
import HtmlHead from './HtmlHead';
import { 
    SITE_META_DESCRIPTION, 
    SITE_CANONICAL_URL,
    SITE_AUTHOR,
    BLOG_SEO_SUBFOLDER } from '../config.js';

class Blogpost extends React.Component {

    componentDidMount() {
        /* 
        this.props.match.params contains URL parameters processed by react router.
        In this case we're retreiving the blog post id, which is the SEO friendly version of the blog post article
        Example, if blog post title is "How to write a blog", the SEO friendly string is "how-to-write-a-blog"
        This string is calculated during blogpost publication and saved in the database.
        Whenever a user requests http://[site_url]/[optional_subfolder]/how-to-write-a-blog , react router detects this
        last string, which we use to get the post's data from dynamodb.
        */
        const post_folder = this.props.match.params.post_folder;
        this.props.getBlogpostContent(post_folder);
    }

    render() {
            if (this.props.blogpost.notFound === true) {
                return <Redirect to="/e404"></Redirect>; // redirect to 404
            }
            if (this.props.blogpost.post_folder) {
                //console.log(this.props.blogpost.postid.S);
                return (
                    <main className="app-container">
                        <HtmlHead title={this.props.blogpost.title.S} description={SITE_META_DESCRIPTION} author={SITE_AUTHOR} canonicalUrl={SITE_CANONICAL_URL+BLOG_SEO_SUBFOLDER+`/${this.props.blogpost.post_folder.S}`} />
                        <article className="posts">
                            <header className="post-header">
                                <h1 className="post-title">{this.props.blogpost.title.S}</h1>
                                <div className="post-meta">
                                    <div>
                                        📅 <span>{dateToNiceString(this.props.blogpost.post_date.S)}</span>
                                    </div>
                                    <div>
                                        🔖 <span>{this.props.blogpost.post_tags.S}</span>		
                                    </div>
                                </div>
                            </header>
                            <div className="post-content" dangerouslySetInnerHTML={{__html: this.props.blogpost.post_body.S}}></div>
                            <Link to="/">↩ Go back</Link>
                        </article>
                    </main>
                );
            } else {
                return <div></div>
            }
            
    }

}

const mapStateToProps = (state) => {
    return { 
        blogpost: state.blogpost
    }
}

export default connect(mapStateToProps, {getBlogpostContent})(Blogpost);