var mysql = require('mysql');
var connection = mysql.createConnection({
	host:'ab3test.cw8kxh7es4kd.us-east-2.rds.amazonaws.com',
	user:'admin',
	password:'admin123',
	database:'Ab3Test',
    port     : 3306
});
// connection.connect(function(error){
// 	if(!!error) {
// 		console.log(error);
// 	} else {
// 		console.log('Connected..!');
// 	}
// });

module.exports = connection;