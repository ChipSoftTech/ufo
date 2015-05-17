Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notfound'  
});
 
Router.route('home', {path: '/'});
Router.route('reports', {path: '/reports'});
Router.route('scrape', {path: '/scrape'});
Router.route('reportdetail', {path: '/reports/:_id'});

