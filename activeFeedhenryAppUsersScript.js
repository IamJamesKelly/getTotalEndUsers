var day = {};
db.totalUsers.remove();

function pluck(item) {
	var domainTotal = 0;
	value = item.value;
	for (it in value.set) {
		var i = value.set[it];
		if (i.date != null) {
			db.userTotal.insert({
				date: i.date,
				total: i.dayTotal
			});
			domainTotal += i.dayTotal;
		}
	}
	
	return domainTotal;
}

var collections = ['domaininstallsdest', 'domaintransactionsdest', 'domainrequestsdest'];

db['total_Domain_users'].remove();
for (col in collections) {
	var colTotal = 0;
	var newCol = collections[col];
	var grandTotal = 0;
	newdate = {};
	db.domain_dates_totalUsers.remove();
	db.userTotal.remove();
	print(newCol);
	
	if (db[newCol].find().toArray().length > 0) {
		db[newCol].mapReduce(function() {
			var date = new Date(this._id.ts);
			var strdate = date.toLocaleDateString();
			date = new Date(strdate);
			this.value.date = date.getTime();
			emit(this._id.domain, this.value);
		}, function(dom, value) {
			var total = [];
			for (val in value) {
				var item = 0;
				for (var prop in value[val]) {
					if (prop != 'total' && !isNaN(value[val][prop]) && prop != 'date') {
						item += value[val][prop];
					}
				}
				total.push({
					date: value[val].date,
					dayTotal: item
				});
			}
			return {
				set: total
			};
		}, {
			out: 'domain_dates_totalUsers',
		});
		var data = db.domain_dates_totalUsers.find().sort({
			'_id.ts': -1
		}).toArray();
		for (item in data) {
			if (item) {
				grandTotal += pluck(data[item]);
			}
		}
	}

	db.userTotal.mapReduce(function() {
		emit(this.date, this.total);
	}, function(date, total) {
		return Array.sum(total);
	}, {
		out: 'domain_dates_totalUsers'
	});

	var array = db.domain_dates_totalUsers.find().toArray();
	for (index in array) {
		var date = new Date(array[index]._id);
		var month = date.getMonth() + 1;
		var day = date.getDate();
		var year = date.getFullYear();
		print(day + '-' + month + '-' + year +',', array[index].value);
	}
	print('Total,',grandTotal);
}