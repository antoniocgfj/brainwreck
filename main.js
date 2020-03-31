var express = require('express');
var mysql = require("mysql");
var bodyParser = require("body-parser");

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', '17771');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/static', express.static("public"));

var pool = mysql.createPool({
  connectionLimit : 10,
        host            : 'classmysql.engr.oregonstate.edu',
        user            : 'cs340_florenan',
        password        : '7636',
        database        : 'cs340_florenan'
    //   host : 'localhost',
    //   user : 'sudol',
    //   password : 'water.mark.1407',
    //   database : 'brainwrecked'
});

// Given in the assignment text to build the table or reset it for testing


// Main home page app
app.get('/', function(req, res, next)
{
        res.sendFile(`index.html`, {root: __dirname});
});

app.get('/fans', function(req, res, next)
{
    var context = {};
    pool.query('SELECT * from Fans', function(err, rows, fields)
    {
        if(err)
        {
            next(err)
            return;
        }

        var fanList = [];
        for (var x in rows)
        {
            var addFanList = {'id': rows[x].ID,
                                'firstName': rows[x].FirstName,
                                'lastName': rows[x].LastName,
                                'email': rows[x].Email,
                                'optIn': rows[x].OptIn};
            fanList.push(addFanList);
        }
        context.results = fanList;
        console.log(context.results);
        res.render('fans', context);
    })

});

app.get('/editFan', function(req, res, next)
{
    var context = {};
    pool.query('SELECT * FROM Fans WHERE id = ?', [req.query.id], function (err, rows, fields)
    {
        var fanList = [];

        for (var x in rows)
        {
            var addFanList = {
                'id': rows[x].ID,
                'firstName': rows[x].FirstName,
                'lastName': rows[x].LastName,
                'email': rows[x].Email,
                'optIn': rows[x].OptIn
            };
            fanList.push(addFanList);
        }
        context = fanList[0];
        console.log(context);
        res.render('fanEdit', context);

    })
});

app.get('/editFanDatabase', function(req, res, next)
{
    var context = {};

    pool.query('SELECT * FROM Fans WHERE ID = ?', [req.query.id], function (err, rows, fields)
    {
        var addFan = {
            'id': rows[0].id,
            'firstName': rows[0].FirstName,
            'lastName': rows[0].LastName,
            'email': rows[0].Email,
            'optIn': rows[0].OptIn
        };

        var OI;
        if ([req.query.optIn])
        {
            OI = 1;
        }
        else
        {
            OI = 0;
        }
        pool.query('UPDATE Fans SET FirstName = ?, LastName = ?, Email = ?, OptIn = ? WHERE ID = ?',
 /*           [req.query.firstName || addFan.firstName,
                req.query.lastName || addFan.lastName,
                req.query.email || addFan.email,
                req.query.optIn || addFan.optIn,
                req.query.id], function (err, result) */
            [req.query.firstName,
                req.query.lastName,
                req.query.email,
                OI,
                req.query.id], function (err, result)
            {
                if (err) throw err;
                console.log(result.affectedRows + " records updated");
                res.redirect('/fans');
            });

    });
});

app.get('/deleteFan', function(req, res, next)
{
    pool.query("DELETE from Fans WHERE id = ?", [req.query.id],
        function(err, rows, fields)
        {
            if (err)
            {
                next(err);
            }
            res.redirect('/fans');
        });
});

app.post('/searchFans', function(req, res, next)
{
   var fName = "";
   var lName = "";
   var email = "";

   if (req.body.searchFirst == "")
   {
       fName = "%";
   }
   else
   {
       fName = "%" + req.body.searchFirst + "%";
   }

   if (req.body.searchLast == "")
   {
       lName = "%";
   }
   else
   {
       lName = "%" + req.body.searchLast + "%";
   }

   if (req.body.searchEmail == "")
   {
       email = "%";
   }
   else
   {
       email = "%" + req.body.searchEmail + "%";
   }

   var context = {};

   pool.query("SELECT * FROM Fans WHERE FirstName like ? AND LastName like ? AND Email like ?",
       [fName, lName, email], function(err, rows, fields)
        {
            var fanList = [];

            for (var x in rows)
            {
                var addFanList = {
                    'id': rows[x].ID,
                    'firstName': rows[x].FirstName,
                    'lastName': rows[x].LastName,
                    'email': rows[x].Email,
                    'optIn': rows[x].OptIn
                };
                fanList.push(addFanList);
            }
            context.results = fanList;
            console.log(context.results);
            res.render('fans', context);
        });
});

app.get('/orders', function(req, res, next)
{
    var context = {};
    pool.query('SELECT * FROM Orders INNER JOIN Fans ON Orders.Fan = Fans.ID INNER JOIN Concerts ON Orders.Concert = ConcertID INNER JOIN Venues ON Concerts.Venue = Venues.VenueID WHERE Fan = ?', [req.query.id], function (err, rows, fields)
    {
        var orderList = [];

        for (var x in rows)
        {
            var addOrderList = {
                'id': rows[x].OrderID,
                'fan': rows[x].Fan,
                'concert': rows[x].Concert,
                'tickets': rows[x].Tickets,
                'fanFirstName': rows[x].FirstName,
                'fanLastName': rows[x].LastName,
                'concertName': rows[x].Name
            };
            orderList.push(addOrderList);
        }
        context.results = orderList;
        context.firstName = rows[0].FirstName;
        context.lastName = rows[0].LastName;
        console.log(context);
        res.render('orders', context);

    })
});

app.get ('/mailList', function(req, res, next)
{
    var context = {};
    res.render('mailList', context);
})

app.post('/addFan', function(req, res, next)
{
    console.log ("AddFan " + req.body.first_name, req.body.last_name, req.body.user_email);
    var context = {};
    var OI = "";

    if (req.body.optIn)
    {
        OI = 1;
    }
    else
    {
        OI = 0;
    }
    console.log("OI is " + OI);

    if (req.body.last_name == "" || req.body.user_email == "")
    {
        console.log ("incomplete insert");
        context.error = "Last Name and email cannot be blank";
        res.render('mailList', context);
    }
    else
    {
        pool.query('INSERT INTO Fans (FirstName, LastName, Email, OptIn) VALUES (?, ?, ?, ?)',
            [req.body.first_name,
                req.body.last_name,
                req.body.user_email,
                OI], function (err, rows, fields)
            {
                if (err)
                {
                    context.error = "Error adding name";
                }
                else
                {
                    context.error = "Name added successfully";
                }
            });
        res.render('mailList', context);
    }
});

app.get('/tour', function (req, res, next)
{
    var context = {};
    pool.query('SELECT * from Concerts INNER JOIN Venues ON ' +
                    'Concerts.Venue = Venues.VenueID ORDER BY Calendar', function(err, rows, fields)
    {
        if(err)
        {
            next(err)
            return;
        }

        var concertList = [];
        for (var x in rows)
        {
            var addConcertList = {'id': rows[x].ConcertID,
                'calendar': rows[x].Calendar,
                'venueId': rows[x].VenueID,
                'venue': rows[x].Name,
                'ticketsSold': rows[x].TicketsSold,
                'ticketsRemaining': rows[x].TicketsRemaining,
                'ticketsAvail': rows[x].TicketsAvail,
                'state': rows[x].State,
                'city': rows[x].City};

            concertList.push(addConcertList);
        }

        // Query just for the venues to be displayed
        pool.query('SELECT * FROM Venues', function(err, rows, fields)
        {
            if(err)
            {
                next(err)
                return;
            }

            var venueList = [];
            for (var x in rows)
            {
                var addVenueList = {'id': rows[x].VenueID,
                    'name': rows[x].Name,
                    'state': rows[x].State,
                    'city': rows[x].City,
                    'maxTickets': rows[x].MaxTickets};

                venueList.push(addVenueList);
            }
            context.results = concertList
            context.venues = venueList;
            res.render('tour', context);
        });
        // context.results = concertList;
        // console.log(context.results);
        // res.render('tour', context);
    });
});

app.post('/addShow', function(req, res, next)
{
    var context = {};

    if (req.body.date == "" || req.body.venue == "")
    {
        console.log ("incomplete insert");
        context.error = "Date and venue cannot be blank";
        res.redirect('/tour');
    }
    else
    {
        pool.query('INSERT INTO Concerts (Calendar, Venue, TicketsSold) VALUES (?, ?, ?)',
            [req.body.date, req.body.venue, 0], function (err, rows, fields)
            {
                if (err)
                {
                    context.error = "Error adding concert";
                }
                else
                {
                    context.error = "Name added successfully";
                }
            });

        res.redirect('/tour');
    }
});

app.get('/deleteShow', function(req, res, next)
{
    pool.query("DELETE from Concerts WHERE ConcertID = ?", [req.query.id],
        function(err, rows, fields)
        {
            if (err)
            {
                next(err);
            }
            res.redirect('/tour');
        });
});

app.get('/editShow', function(req, res, next)
{
    var context = {};
    console.log(req.query.id);
    pool.query('SELECT * FROM Concerts INNER JOIN Venues ON ' +
                    'Concerts.Venue = Venues.VenueID WHERE ConcertID = ?',[req.query.id], function(err, rows, fields)
    {
        if(err)
        {
            next(err)
            return;
        }

        var concertList = [];
        for (var x in rows)
        {
            var addConcertList = {'id': rows[x].ConcertID,
                'venueId': rows[x].VenueID,
                'calendar': rows[x].Calendar,
                'venue': rows[x].Name,
                'ticketsSold': rows[x].TicketsSold,
                'ticketsRemaining': rows[x].TicketsRemaining,
                'ticketsAvail': rows[x].TicketsAvail,
                'state': rows[x].State,
                'city': rows[x].City};

            concertList.push(addConcertList);
        }
        context.results = concertList[0];

        pool.query('SELECT * FROM Venues', function(err, rows, fields)
        {
            if(err)
            {
                next(err)
                return;
            }
            var venueList = [];
            for (var x in rows)
            {
                if (rows[x].Name != context.results.venue) {
                    var addVenueList = {'venueId': rows[x].VenueID,
                    'name': rows[x].Name,
                    'state': rows[x].State,
                    'city': rows[x].City};
                    venueList.push(addVenueList);
                }
            }
            context.venues = venueList;
            res.render('showEdit', context);
        });
    });
});

app.get('/editShowDatabase', function(req, res, next)
{
    var context = {};
    console.log(req.query.id);
    console.log(req.query.date);
    console.log(req.query.show);

    pool.query('UPDATE Concerts SET Calendar = ?, Venue = ? WHERE ConcertID = ?',[req.query.date, req.query.show, req.query.id], function (err, result)
    {
        if (err) throw err;
        console.log(result.affectedRows + " records updated");
        res.redirect('/tour');
    });        
});

app.get('/buyShow', function(req, res, next)
{
    var context = {};
    console.log(req.query.id);
    pool.query('SELECT * FROM Fans', function(err, rows, fields)
    {
        if(err)
        {
            next(err)
            return;
        }

        var fanList = [];
        for (var x in rows)
        {
            var addFanList = {'id': rows[x].ID,
                'firstName': rows[x].FirstName,
                'lastName': rows[x].LastName,
                'email': rows[x].Email};

            fanList.push(addFanList);
        }
        context.results = fanList;
        context.showID = req.query.id;
        res.render('showBuy', context);
    });
});

app.get('/buyShowDatabase', function(req, res, next)
{
    var context = {};

    pool.query('INSERT INTO ConcertsAttended (Fan, Concert) VALUES (?, ?)',[req.query.fan, req.query.id], function (err, result)
    {
        if (err) throw err;

        pool.query('INSERT INTO Orders (Fan, Concert, Tickets) VALUES (?, ?, ?)', [req.query.fan, req.query.id, req.query.amount], function(err, result)
        {
            if (err) throw err;

            console.log(result.affectedRows + " records updated");
            res.redirect('/tour');
        }); 
    });        
});

app.get('/shows', function(req, res, next)
{
    var context = {};
    pool.query('SELECT * from Fans', function(err, rows, fields)
    {
        if(err)
        {
            next(err)
            return;
        }

        var fanList = [];
        for (var x in rows)
        {
            var addFanList = {'id': rows[x].ID,
                'name': rows[x].FirstName + " " + rows[x].LastName};
            fanList.push(addFanList);
        }

        pool.query('SELECT * FROM Concerts INNER JOIN Venues ON ' +
                                'Concerts.Venue = Venues.VenueID', function(err, rows, fields)
        {
            var shows = [];
            for (var x in rows)
            {
                var addShows = {'showID': rows[x].ConcertID,
                                'calendar': rows[x].Calendar,
                                'venue': rows[x].Name};
                shows.push(addShows);
            }
            context.shows = shows;
            console.log(context.fans, context.shows);
            res.render('shows', context);
        });
        context.fans = fanList;

    });
});

app.post('/shows', function(req, res, next)
{
    var fanId = req.body.fan;
    var showId = req.body.show;

    var context = {};

    // Query if a fan was submitted
    if (fanId) {
        pool.query("SELECT DISTINCT * FROM Fans INNER JOIN ConcertsAttended ON Fans.ID = ConcertsAttended.Fan INNER JOIN Concerts ON Concerts.ConcertID = ConcertsAttended.Concert INNER JOIN Venues ON Concerts.Venue = Venues.VenueID WHERE Fans.ID = ?", [fanId], function(err, rows, fields)
        {
            var fanList = [];

            for (var x in rows)
            {
                var addFanList = {
                    'id': rows[x].ID,
                    'firstName': rows[x].FirstName,
                    'lastName': rows[x].LastName,
                    'email': rows[x].Email,
                    'optIn': rows[x].OptIn,
                    'venue': rows[x].Name
                };
                fanList.push(addFanList);
            }
            context.fanResults = fanList;
            console.log(context.fanResults);
            res.render('shows', context);
        });
    } else if (showId) { // Query if a show was submitted
        pool.query("SELECT DISTINCT * FROM Fans INNER JOIN ConcertsAttended ON Fans.ID = ConcertsAttended.Fan INNER JOIN Concerts ON Concerts.ConcertID = ConcertsAttended.Concert INNER JOIN Venues ON Concerts.Venue = Venues.VenueID WHERE Concerts.ConcertID = ?",
        [showId], function(err, rows, fields)
        {
            var concertList = [];

            for (var x in rows)
            {
                var addShowList = {
                    'id': rows[x].ID,
                    'firstName': rows[x].FirstName,
                    'lastName': rows[x].LastName,
                    'email': rows[x].Email,
                    'optIn': rows[x].OptIn,
                    'venue': rows[x].Name
                };
                concertList.push(addShowList);
            }
            context.showResults = concertList;
            console.log(context.showResults);
            res.render('shows', context);
        });
    }

});

app.get('/aboutUs', function(req, res, next)
{
        res.render('aboutUs');
});

app.get('/funFacts', function(req, res, next)
{
        res.render('funFacts');
});

app.get('/pictures', function(req, res, next)
{
        res.render('pictures');
});

app.get('/contactUs', function(req, res, next)
{
        res.render('contactUs');
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
