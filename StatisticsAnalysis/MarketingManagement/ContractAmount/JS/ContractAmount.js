$(function () {
           var mpcharts = echarts.init(document.getElementById('mp-chart'));//业务员统计图表
           var dscharts = echarts.init(document.getElementById('ds-chart'));//部门统计图表
           var allcharts = echarts.init(document.getElementById('all-chart'));//全年统计图表
           //初始化dataPerson对象
           var dataPerson = {
               isInit: 'true',
               dataLinker: [],
               dataLinkNum: [],
               dataLinkMoney: []
           }
           //初始化dataDepartment
           var dataDepartment = {
               isInit: 'true',
               dataYear: [],
               dataLinkNum: [],
               dataLinkMoney: []
           }
           //初始化dataAllYear
           var dataAllyear = [];
           /*[
                   {
                       name: '业务数',
                       type: 'line',
                       data: data.dataLinkNum,
                   },
                   {
                       name: '业务金额',
                       type: 'line',
                       data: data.dataLinkMoney,
                   },
                   ...
             ]
           */
           $(document).ready(init);

           //页面加载初始化
           function init() {
               //解决IE8下indexOf无法使用的问题
               solveIE8Index();
               //初始化时清空 业务员列表 中内容
               $('.table-content ul').html('');
               //初始化图表加载
               mpcharts.showLoading();
               dscharts.showLoading();
               allcharts.showLoading();
               //初始化索引
               var perLastIndex = $('#mp-title').find('li').eq(-1);
               var dsLastIndex = $('#ds-title').find('li').eq(-1);
               //初始化获取数据为按 "本年"
               getData('LoadMainPlanByYear', '#mp-table-content');
               getData('LoadMPDeptByYear', '#ds-table-content');
               getData('LoadMPAllStaticsByYear', '#all-table-content');
               //选项点击部分

               $('#goback').click(function () {
                   window.history.back(-1);
               });


               //选项卡切换
               $('#mp-title').find('li').click(function () {
                   $(perLastIndex).removeClass('click');
                   $(this).addClass('click');
                   perLastIndex = this;
               });
               $('#ds-title').find('li').click(function () {
                   $(dsLastIndex).removeClass('click');
                   $(this).addClass('click');
                   dsLastIndex = this;
               })

               //点击按钮触发相应的事件
               $('.title').find('li').click(function () {

                   //置空dataPerson对象
                   dataPerson = {
                       isInit: 'true',
                       dataLinker: [],
                       dataLinkNum: [],
                       dataLinkMoney: []
                   }
                   //置空dataDepartment对象
                   dataDepartment = {
                       isInit: 'true',
                       dataYear: [],
                       dataLinkNum: [],
                       dataLinkMoney: []
                   }
                   switch ($(this).attr('id')) {
                       //部门统计部分
                       case 'ds-day':
                           getData('LoadMPDeptByDay', '#ds-table-content');
                           break;
                       case 'ds-month':
                           getData('LoadMPDeptByMonth', '#ds-table-content');
                           break;
                       case 'ds-quarter':
                           getData('LoadMPDeptByQuarter', '#ds-table-content');
                           break;
                       case 'ds-half':
                           getData('LoadMPDeptByHalfYear', '#ds-table-content');
                           break;
                       case 'ds-year':
                           getData('LoadMPDeptByYear', '#ds-table-content');
                           break;
                           //业务员统计部分
                       case 'mp-day':
                           getData('LoadMainPlanByDay', '#mp-table-content');
                           break;
                       case 'mp-month':
                           getData('LoadMainPlanByMonth', '#mp-table-content');
                           break;
                       case 'mp-quarter':
                           getData('LoadMainPlanByQuarter', '#mp-table-content');
                           break;
                       case 'mp-half':
                           getData('LoadMainPlanByHalfYear', '#mp-table-content');
                           break;
                       case 'mp-year':
                           getData('LoadMainPlanByYear', '#mp-table-content');
                           break;
                   }
               });
           }

           //获取数据
           function getData(option, listId) {
               // 弃用 【$.getJSON】 的原因是因为在 【$.getJSON】 的内部调用了 【$.ajax】
               // 与此相同的还有 【$.get】
               $.ajax({
                   url: '/Handler/ERP/MarktingManagement/StatisticsHandler.ashx',
                   data: { option: option },
                   success: function (data) {
                       data = $.parseJSON(data);
                       $(listId).find('ul').html(''); //置空数据冗余
                       var arrList = []; //类似于文档碎片的作用
                       switch (listId) {
                           case '#mp-table-content':
                               for (var i = 0; i < data.total; i++) {
                                   var li = '<li><span>' + data.data[i].业务员 + '</span><span>' + data.data[i].业务数 + '</span><span>' + data.data[i].业务金额 + '</span></li>'
                                   dataPerson.dataLinker.push(data.data[i].业务员);
                                   dataPerson.dataLinkNum.push(data.data[i].业务数);
                                   dataPerson.dataLinkMoney.push(data.data[i].业务金额);
                                   arrList[i] = li;
                               }
                               mpcharts.hideLoading();
                               mpcharts.setOption(loadPerEchart(dataPerson));
                               break;

                           case '#ds-table-content':
                               for (var i = 0; i < data.total; i++) {
                                   var li = '<li><span>' + data.data[i].年份 + '</span><span>' + data.data[i].业务数 + '</span><span>' + data.data[i].业务金额 + '</span></li>'
                                   dataDepartment.dataYear.push(data.data[i].年份);
                                   dataDepartment.dataLinkNum.push(data.data[i].业务数);
                                   dataDepartment.dataLinkMoney.push(data.data[i].业务金额);
                                   arrList[data.total - i] = li;
                               }
                               dscharts.hideLoading();
                               dscharts.setOption(loadDeptEcahrt(dataDepartment));
                               break;
                           case '#all-table-content':
                               var initData = data.data;//这里我们初始化一个initData用来记录视图拿到的数据，后面会与addData进行拼接
                               var subDataYear = []; //首先拿到年
                               var subDataYearUnique = []; //这是用来存储去重后的年
                               var subDataMonth = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']; //这是所有月份的集合，用来与之后的月份做减法操作
                               var subSumYearObj = {}; //每个年份对应的数量 对象类型
                               var subSumYearArr = []; //每个年份对应的数量 数组类型
                               var addData = []; //需要填充进去的数据
                               var indexArr = []; //存储月份不够的年数 具体索引
                               for (var i = 0; i < data.total; i++) {
                                   var li = '<li><span>' + data.data[i].年月 + '</span><span>' + data.data[i].业务数 + '</span><span>' + data.data[i].业务金额 + '</span></li>'
                                   /*dataDepartment.dataYear.push(data.data[i].年月);
                                   dataDepartment.dataLinkNum.push(data.data[i].业务数);
                                   dataDepartment.dataLinkMoney.push(data.data[i].业务金额);*/
                                   arrList[data.total - i] = li;
                                   //填充dataAllYear部分
                                   subDataYear.push(data.data[i].年);
                                   //subDataMonth.push(data.data[i].月);
                               }

                               subDataYearUnique = unique(subDataYear); //拿到去重后的年份
                               var subSumYear = countNum(subDataYear); //拿到各年份的数目
                               //拿到数目
                               for (var key in subSumYear) {
                                   subSumYearArr.push(subSumYear[key]);
                               }
                               for (var i = 0; i < data.total ; i++) {
                                   var index = subDataYearUnique.indexOf(data.data[i].年);
                                   //获取非最后一年的其他所有年数的数据
                                   if ((index != -1) && (index != subDataYearUnique.length)) {
                                       //操作包括最新一年的所有年份
                                       if (subSumYearArr[index] < 12) {
                                           indexArr.push(index); //拿到年数月份缺少不够的 具体年份
                                       }
                                   }
                               }
                               indexArr = unique(indexArr); //去重后，获取具体的年份索引
                               var MonthArr = new Array(); //这里用来存储具体的月份  二维数组
                               var subMonthArr = [];
                               for (var j = 0 ; j < indexArr.length ; j++) {
                                   //这里开始对月份进行统计
                                   subMonthArr.splice(0, subMonthArr.length);
                                   for (var i = 0; i < data.total ; i++) {
                                       if (data.data[i].年 == subDataYearUnique[indexArr[j]]) {
                                           subMonthArr.push(data.data[i].月);
                                       }
                                   }
                                   //这里存储二维数组
                                   //一维长度为i,i为变量，可以根据实际情况改变

                                   MonthArr[j] = new Array();  //声明二维，每一个一维数组里面的一个元素都是一个数组；
                                   for (var m = 0; m < subMonthArr.length; m++) {
                                       MonthArr[j][m] = subMonthArr[m];
                                   }
                               }
                               //由上，我们可以得知月份不足的年份具体所含有的月份，并保存在二维数组 MonthArr中
                               //现在我们开始便利这个二维数组，然后拿到缺少的月份,当然前提是我们都知道一年中含有12个月份
                               //在这里我们再定义一个二维数组lackMonthArr来存储缺少的月份
                               var lackMonthArr = new Array();
                               for (var m = 0 ; m < indexArr.length ; m++) {
                                   subDataMonth = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
                                   //取数组的差 subDataMonth  - MonthArr[i] 并存储在subDataMonth中
                                   for (var i = subDataMonth.length - 1; i >= 0; i--) {
                                       a = subDataMonth[i];
                                       for (var j = MonthArr[m].length - 1; j >= 0; j--) {
                                           b = MonthArr[m][j];
                                           if (a == b) {
                                               subDataMonth.splice(i, 1);
                                               MonthArr[m].splice(j, 1);
                                               break;
                                           }
                                       }
                                   }
                                   lackMonthArr[m] = new Array();
                                   for (var i = 0 ; i < subDataMonth.length ; i++) {
                                       lackMonthArr[m][i] = subDataMonth[i];
                                   }
                               }
                               //由上，我们拿到了所缺少的月份，并存储在二维数组 lackMonthArr 中
                               //至此，我们获得了 所缺少的年份数组  subDataYearUnique  以及 对应所缺少的月份  lackMonthArr
                               //现在，我们给对应的年份及月份增加对应的信息
                               var addData = new Array();
                               var indexArrlen = indexArr.length;
                               for (var i = 0 ; i < indexArrlen ; i++) {
                                   for (var j = 0 ; j < lackMonthArr[i].length; j++) {
                                       //这里需要用到的字段其实只有 '年','月','业务金额'
                                       addData.push(
                                       {
                                           '业务数': 0,
                                           '业务金额': 0,
                                           '年': subDataYearUnique[indexArr[i]],
                                           '月': lackMonthArr[i][j],
                                           '年月': subDataYearUnique[indexArr[i]] + '-' + lackMonthArr[i][j]
                                       })
                                   }
                               }
                               console.log(addData);
                               var lastDataArr = addData.concat(initData);
                               console.log(lastDataArr);
                               //获得所有所需的数据之后，我们可以构建新的数组对象seriesData，用来填充series
                               var seriesData = [];
                               //首先我们需要弄清楚seriesData的数组长度，显然这是和subDataYearUnique的长度是一样的

                               for (var i = 0 ; i < subDataYearUnique.length ; i++) {
                                   //遍历数组，按年份分类, seriesData同样是二维数组
                                   seriesData[i] = new Array();
                                   var index = 0;
                                   for (var j = 0 ; j < lastDataArr.length ; j++) {
                                       if (lastDataArr[j].年 == subDataYearUnique[i]) {
                                           //subDataYearUnique中的年份是排序好的，按年分类不能完全保证月份的顺序
                                           seriesData[i][index] = lastDataArr[j];
                                           index++;
                                       }
                                   }
                               }
                               //按年分类后开始按月份排序
                               for (var i = 0 ; i < subDataYearUnique.length ; i++) {
                                   seriesData[i].sort(by('月'));
                               }
                               //只需要里面的业务金额，我们还需要一个二维数组 priceArr
                               var priceArr = [];
                               for (var i = 0 ; i < subDataYearUnique.length ; i++) {
                                   priceArr[i] = new Array();
                                   for (var j = 0 ; j < seriesData[i].length ; j++) {
                                       priceArr[i][j] = seriesData[i][j].业务金额;
                                   }
                               }
                               console.log(seriesData);
                               console.log(priceArr);
                               //定义seriesData
                               var seriesDataToChart = [];
                               for (var i = 0 ; i < subDataYearUnique.length ; i++) {
                                   //这里的要存储的data即为对应的业务金额

                                   seriesDataToChart.push({
                                       name: subDataYearUnique[i],
                                       type: 'line',
                                       data: priceArr[i],

                                   })
                               }
                               //定义哪些默认已选中
                               var selectDataArr = {};
                               for (var i = 0 ; i < subDataYearUnique.length - 3; i++) {
                                   var key = subDataYearUnique[i];
                                   var value = false;
                                   selectDataArr[key] = value;
                               }
                               for (var i = subDataYearUnique.length - 3 ; i < subDataYearUnique.length; i++) {
                                   var key = subDataYearUnique[i];
                                   var value = true;
                                   selectDataArr[key] = value;
                               }
                               allcharts.hideLoading();
                               allcharts.setOption(loadAllYearEcahrt(seriesDataToChart, subDataYearUnique, selectDataArr));

                               break;
                       }
                       $(listId).find('ul').html(arrList.join('')); //填充表格数据
                   },
                   error: function () {
                       console.log('请求连接发生错误');
                   }
               });
           }

           //加载 业务员【业务数】、【业务金额】图形函数
           function loadPerEchart(data) {
               optionPer = {
                   /*title: {
                       text: '个人业务数和业务金额',
                   },*/
                   tooltip: {
                       trigger: 'axis'
                   },
                   legend: {
                       data: ['业务数', '业务金额']
                   },
                   grid: {
                       left: '5%',
                       right: '10%',
                       bottom: '3%',
                       containLabel: true
                   },
                   toolbox: {
                       show: true,
                       feature: {
                           saveAsImage: { show: true }
                       }
                   },
                   calculable: true,
                   xAxis: [
                       {
                           type: 'category',
                           data: data.dataLinker
                       }
                   ],
                   yAxis: [
                       {
                           type: 'value'
                       }
                   ],
                   series: [
                       {
                           name: '业务数',
                           type: 'bar',
                           data: data.dataLinkNum,
                           markLine: {
                               data: [
                                   { type: 'average', name: '平均值' }
                               ]
                           }
                       },
                       {
                           name: '业务金额',
                           type: 'bar',
                           data: data.dataLinkMoney,
                           markLine: {
                               data: [
                                   { type: 'average', name: '平均值' }
                               ]
                           }
                       }
                   ]
               };
               return optionPer;
           }

           //加载 部门【业务数】、【业务金额】图形函数
           function loadDeptEcahrt(data) {
               optionDept = {
                   /*title: {
                       text: '各年份业务金额'
                   },*/
                   tooltip: {
                       trigger: 'axis'
                   },
                   legend: {
                       data: ['业务数', '业务金额']
                   },
                   grid: {
                       left: '5%',
                       right: '10%',
                       bottom: '3%',
                       containLabel: true
                   },
                   toolbox: {
                       feature: {
                           saveAsImage: {}
                       }
                   },
                   xAxis: {
                       type: 'category',
                       boundaryGap: false,
                       data: data.dataYear
                   },
                   yAxis: {
                       type: 'value'
                   },
                   series: [
                       {
                           name: '业务数',
                           type: 'line',
                           data: data.dataLinkNum,
                           markLine: {
                               data: [
                                   { type: 'average', name: '平均值' }
                               ]
                           }
                       },
                       {
                           name: '业务金额',
                           type: 'line',
                           data: data.dataLinkMoney,
                           markLine: {
                               data: [
                                   { type: 'average', name: '平均值' }
                               ]
                           }
                       },

                   ]
               };
               return optionDept;
           }

           //加载 全年数据
           function loadAllYearEcahrt(data, datalegend, selected) {
               optionAllYear = {
                   /*title: {
                       text: '历年业务金额',
                       top: '60',
                   },*/
                   tooltip: {
                       trigger: 'axis'
                   },
                   grid: {
                       left: '3%',
                       right: '4%',
                       bottom: '15%',
                       top: '100',
                       containLabel: true
                   },
                   legend: {
                       data: datalegend,
                       selected: selected
                   },
                   toolbox: {
                       feature: {
                           saveAsImage: {}
                       }
                   },
                   xAxis: {
                       type: 'category',
                       boundaryGap: false,
                       data: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', ]
                   },
                   yAxis: {
                       type: 'value'
                   },
                   series: data
               };
               return optionAllYear;
           }

           //数组去重
           function unique(ary) {
               var o = {}, i, l = ary.length, r = [];
               for (i = 0; i < l; i++) o[ary[i]] = ary[i];
               for (i in o) r.push(o[i]);
               return r;
           };
           //数组中各元素的数目
           function countNum(arr) {
               var newArr = [],
                   len = arr.length,
                   obj = {};

               for (var count = 0 ; count < len ; count++) {
                   if (obj[arr[count].toString()]) {
                       obj[arr[count].toString()]++;
                   } else {
                       obj[arr[count].toString()] = 1;
                   }

               }
               return obj;

           }
           //对象数组排序
           function by(name) {
               return function (o, p) {
                   var a, b;
                   if (typeof o === "object" && typeof p === "object" && o && p) {
                       a = o[name];
                       b = p[name];
                       if (a === b) {
                           return 0;
                       }
                       if (typeof a === typeof b) {
                           return a < b ? -1 : 1;
                       }
                       return typeof a < typeof b ? -1 : 1;
                   }
                   else {
                       throw ("error");
                   }
               }
           }
           //解决IE8下不支持IndexOf问题
           function solveIE8Index() {
               if (!Array.prototype.indexOf) {
                   Array.prototype.indexOf = function (elt /*, from*/) {
                       var len = this.length >>> 0;

                       var from = Number(arguments[1]) || 0;
                       from = (from < 0)
                            ? Math.ceil(from)
                            : Math.floor(from);
                       if (from < 0)
                           from += len;

                       for (; from < len; from++) {
                           if (from in this &&
                               this[from] === elt)
                               return from;
                       }
                       return -1;
                   };
               }
           }
       })