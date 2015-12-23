exports.render = function(req,res) {
  var lastVisit = 'Osten';
  if (req.session.lastVisit) {
    lastVisit = req.session.lastVisit;
  }

  req.session.lastVisit = new Date();

  res.render('index', {
    lastVisit: lastVisit 
  })
};
