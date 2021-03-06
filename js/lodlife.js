$(function () {
  $('#gmap').gmap3({
    latitude: 35.35914,
    longitude:139.460994,
    zoom:12,
    navigationControl: true,
    mapTypeControl:true,
    ScaleControl:true,
    });
  
  $('#youchien').submit(function (e) {
    e.preventDefault();
    var self = this;

    var querytext = (function (){

      var requiredItems = [
        {name: 'name', prop: 'http://dbpedia.org/property/name'},
        {name: 'owner', prop: 'http://data.tom.sfc.keio.ac.jp/property/設置者名'},
        {name: 'zipcode', prop: 'http://dbpedia.org/property/zipcode'},
        {name: 'address', prop: 'http://dbpedia.org/property/address'},
        {name: 'long', prop: 'http://www.w3.org/2003/01/geo/wgs84_pos#long'},
        {name: 'lat', prop: 'http://www.w3.org/2003/01/geo/wgs84_pos#lat'},
        {name: 'phoneNumber', prop: 'http://dbpedia.org/property/phoneNumber'},
        {name: 'website', prop: 'http://dbpedia.org/property/website'},
      ];

      var optionalItems = [
        {name: 'azukari', prop: 'http://data.tom.sfc.keio.ac.jp/property/預かり保育'},
        {name: 'bus', prop: 'http://data.tom.sfc.keio.ac.jp/property/通園バス'},
        {name: 'kyushoku', prop: 'http://data.tom.sfc.keio.ac.jp/property/給食'},
        {name: 'capacity', prop: 'http://data.tom.sfc.keio.ac.jp/property/定員（合計）'},
        {name: 'capacity3', prop: 'http://data.tom.sfc.keio.ac.jp/property/定員（３歳）'},
        {name: 'capacity4', prop: 'http://data.tom.sfc.keio.ac.jp/property/定員（４歳）'},
        {name: 'capacity5', prop: 'http://data.tom.sfc.keio.ac.jp/property/定員（５歳）'},
        {name: 'time2', prop: 'http://data.tom.sfc.keio.ac.jp/property/保育時間帯（２歳）'},
        {name: 'time3', prop: 'http://data.tom.sfc.keio.ac.jp/property/保育時間帯（３歳）'},
        {name: 'time4', prop: 'http://data.tom.sfc.keio.ac.jp/property/保育時間帯（４歳）'},
        {name: 'time5', prop: 'http://data.tom.sfc.keio.ac.jp/property/保育時間帯（５歳）'},
      ];

      var querytext = [
        'SELECT ',
        // 変数をきめる
        (function () {
          var s = [];
          // 常に欲しいもの
          requiredItems.forEach(function (item) {
            s.push('?' + item.name);
          });
          // オプション
          optionalItems.forEach(function (item) {
            $('input:checked', self).each(function () {
              if (this.value == item.name) {
                s.push('?' + item.name);
              }
            });
          });
          return s.join(' ');
        })(),
        ' { ',
        // 検索条件を決める
        (function () {
          var s = [];
          // 常にほしいもの
          requiredItems.forEach(function (item) {
            s.push('?s <' + item.prop + '> ?' + item.name + ' .');
          });
          // オプション
          optionalItems.forEach(function (item) {
            $('input:checked', self).each(function () {
              if (this.value == item.name) {
                s.push('?s <' + item.prop + '> ?' + item.name + ' .');
              }
            });
          });
          return s.join(' ');
        })(),
        // 条件
        (function () {
          var values = [], conditions = [];
          $('input:checked', self).each(function () {
            values.push(this.value);
          });
          if (values.length) {
            values.forEach(function (name) {
              conditions.push('?' + name + '=\"true\"');
            });
            return ' filter(' + conditions.join('||') + ') ';
          }
        })(),
        '} limit 50'
      ].join('');

      return querytext;

    })();

    console.log(querytext);

    $.ajax({
      type: 'post',
      url: 'http://data.tom.sfc.keio.ac.jp/sparql',
      dataType: 'jsonp',
      data: {
        query: querytext
      },
      success: function(data) {
        renderResult(data);
      },
      error: function() {
        console.log('error');
      }
    });

    var renderResult = function (data) {
      $("#result").empty();
      data.forEach(function (youchien) {
        console.log(youchien.long.value);
        $('#gmap').gmap3({
    latitude: 35.35914,
    longitude:139.460994,
    zoom:12,
    navigationControl:true,
    mapTypeControl:true,
    ScaleControl:true,
    markers:[
      {
        title:youchien.name.value,
        latitude:youchien.lat.value,
        longitude:youchien.long.value,
		icon:'img/lod_pin.png',
        content:youchien.name.value+'</br>電話番号：0466-'+youchien.phoneNumber.value+'</br><a href='+youchien.website.value+' target="brank">'+youchien.website.value+'</a></br>',
      }
    ]
    });
        $("#result").append(
          '<p>'+youchien.name.value+'</p>'+
		  '<ul>' +
		  '<li>' + youchien.address.value + '</li>' +
          '<li>0466-' + youchien.phoneNumber.value + '</li>' +
          '<li><a href='+ youchien.website.value +' target="brank">' + youchien.website.value + '</li>' +
          '</ul>'

        );
      });
    };

  });
});