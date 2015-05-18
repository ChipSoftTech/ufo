Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notfound'  
});
 
Router.route('home', {path: '/'});
Router.route('scrape', {path: '/scrape'});
    