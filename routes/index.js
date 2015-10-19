var express = require('express');
var router = express.Router();
var db =require('monk')('localhost/user');
var Users = db.get('users');
var Students = db.get('students')
var bcrypt = require('bcrypt')


router.get('/', function(req, res, next){
  res.redirect('/register');
});

router.get('/signin', function(req, res, next){
  res.render('signin');
});

router.get('/register', function(req, res, next){
  res.render('index');
});

router.get('/new', function(req, res, next){
  var username = req.session.username
  res.render('new', {username: username});
})

router.get('/signout', function(req, res, next){
  req.session = null;
  res.redirect('/signin');
});

router.get('/student', function(req, res, next){
  var username = req.session.username
  Students.find({}, function(err, data){
  res.render('show', {username: username, allStudents: data});
});
});
router.post('/', function(req, res, next){
  var hash = bcrypt.hashSync(req.body.password, 12);
  var errors = [];
  if (req.body.email == 0){
    errors.push('Email Cannot be Blank!');
  }
  if (req.body.password == 0){
    errors.push('Password Cannot be Blank!')
  }
  if(req.body.password !== req.body.confirmation){
    errors.push('Password and Confirmation must match!')
  }
  if(errors.length){
    res.render('index', {errors:errors});
  }
  else{
    Users.find({email: req.body.email.toLowerCase()}, function(err, data){
      if(data.length > 0){
        errors.push('Email Alreay Registered!');
        res.render('index', {errors:errors});
      }
      else{
        Users.insert({email: req.body.email.toLowerCase(), passwordDigest: hash}, function(err, data){
          req.session.username = req.body.email;
          res.redirect('/student')
        });
      }
    });
  }
});

router.post('/signin', function(req, res, next){
  var errors = [];
  if(req.body.email == 0){
    errors.push('Email Cannot be Blank!');
  }
  if(req.body.password == 0){
    errors.push('Password Cannot be Blank!');
  }
  if(errors.length){
    res.render('signin', {errors: errors})
  }
  else{
    Users.findOne({email: req.body.email.toLowerCase()}, function(err, data){
      if(data){
        if(bcrypt.compareSync(req.body.password, data.passwordDigest)){
          req.session.username = req.body.email;
          res.redirect('/student')
        }
        else{
          errors.push('Invalid Email/Password Combination');
          res.render('signin', {errors:errors})
        }

      }else{
        errors.push('Email Does Not Exist');
        res.render('signin', {errors:errors})
      }
    })
  }
})

router.post('/new', function(req, res, next){
  var username = req.session.username
  var errors = [];
  if(req.body.name == 0){
    errors.push('Name Cannot Be Blank!');
  }
  if(req.body.telephone == 0){
    errors.push('Telephone Cannot Be Blank!');
  }
  if(errors.length){
    res.render('new', {errors:errors, username: username});
  }
  else{
    Students.find({name: req.body.name}, function(err, data){
      if(data.length > 0){
        errors.push('Name already registered!');
        res.render('new', {errors:errors, username: username});
      }
      else{
        Students.insert({name: req.body.name,
                    telephone: req.body.telephone});
        res.redirect('student');
      }
  });
  }
});
    

router.post('/:id/delete', function(req, res, next){
  Students.remove({_id: req.params.id}, function(err, data){
    res.redirect('/student')
  })
})

  router.get('/:id', function(req, res, next){
    Students.findOne({_id: req.params.id}, function(err, data){
      res.render('showing', {theStudents: data})
    })
  })

module.exports = router;
