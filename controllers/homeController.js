/*
 This is a home controller.
*/
module.exports.home = function(req, res){
    let user = req.user;
    console.log(user)
    return res.render('home', {
        title: 'Home',
        email: user.email ,
    });
}