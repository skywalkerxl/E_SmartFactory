
$(function () {
    $(document).ready(init);
    var onOff = true;
    var year = 0 //parseInt(new Date().getFullYear()); //初始化年份为当前年份,这里设为0好了，因为这并不重要
    var pmOnOff = false;
    var tmOnOff = false;
    var set_pmOnOff_value = function (_pmOnOff, event) {
        pmOnOff = _pmOnOff;
        if (event) {
            event();
        }
    };
    var set_tmOnOff_value = function (_tmOnOff, event) {
        tmOnOff = _tmOnOff;
        if (event) {
            event();
        }
    };
    var dataSankey = {
        "nodes": [],
        "links": []
    }

    var arrPmSubName = []; //设置生产子计划号
    var arrTmSubName = []; //设置工艺子计划号
    var mpID = 0; //定义全局变量 存储主计划号
    var myCharts = echarts.init(document.getElementById('show-chart'));
    $('#mp-chart').css('display', 'none');
    function init() {
        //解决IE8不支持map
        supportMap();
        //解决IE8不支持indexOf 
        solveIE8Index();
        myCharts.showLoading();
        //获取年份
        getData(initYearCount(), 'year-select')
        //主计划表数据
        getData(initMainPlanData(year), 'mp-list-content');
        changeOption('mp-list-content');
        listAnimate('mp-list-content');
        yearSelect();
    }
    //初始化 数据库查询到的年份
    function initYearCount() {
        var dataMianPlan = {
            option: 'yearlist'
        };
        return dataMianPlan;
    }
    //初始化为 当前年查询到的
    function initMainPlanData(year) {
        var dataMianPlan = {
            option: 'mainplan',
            start: '0',
            limit: '10000',
            sort: JSON.stringify({
                property: 'ZscPlanBiaoID',
                direction: 'ASC'
            }),
            SearchInfo: JSON.stringify([
                {
                    field: "outstate",
                    value: "部分出库",
                    opt: 1,
                    link: false,
                    group: 1
                }, {
                    field: "outstate",
                    value: "",
                    opt: 11,
                    link: false,
                    group: 1
                }, {
                    field: "ZbDate",
                    value: year.toString() + "%",
                    opt: 8,
                    link: true,
                    group: 0
                }
            ])
        };
        return dataMianPlan;
    }
    
    //点选列表主计划号 显示生产子计划号
    function loadPMSubPlanData(mpID) {
        var dataSubPlan = {
            option: 'pmsubplan',
            start: '0',
            limit: '100000',
            sort: JSON.stringify({
                property: 'FscPlanBiaoID',
                direction: 'ASC'
            }),
            SearchInfo: JSON.stringify([
                {
                    field: 'ZscPlanBiaoID',
                    value: mpID,
                    opt: 1,
                    link: false,
                    group: 1
                }
            ])
        };
        return dataSubPlan;
    }
    //点选列表主计划号 显示工艺子计划号
    function loadTMSubPlanData(mpID) {
        var dataSubPlan = {
            option: 'tmsubplan',
            start: '0',
            limit: '100000',
            sort: JSON.stringify({
                property: 'FscPlanBiaoID',
                direction: 'ASC'
            }),
            SearchInfo: JSON.stringify([
                {
                    field: 'ZscPlanBiaoID',
                    value: mpID,
                    opt: 1,
                    link: false,
                    group: 1
                }
            ])
        };
        return dataSubPlan;
    }

    /* 获取数据 */
    function getData(data, listID) {
        $('#' + listID).html('<li class="no-more">正在加载······</li>');
        var asOnOff = false;
        switch (listID) {
            case 'year-select':
                asOnOff = false; //关闭异步ajax，必须在调用完成之后才开始加载其他数据
                break;
            default:
                asOnOff = true;
        }
        $.ajax({
            url: '/Handler/ERP/MarktingManagement/ScheduleAnalysisHandler.ashx',
            data: data,
            async:asOnOff,
            success: function (data) {
                data = JSON.parse(data);
                setData(data, listID);
            },
            error: function (status) {
                console.log(status);
            }
        })
        
    }

    /*填充表格数据*/
    function setData(data, listID) {
        var arrlist = [];
        var len = data.data.length;  //获取get到的数据的长度
        switch (listID) {
            case 'mp-list-content':
                if (len != 0) {
                    for (var i = 0 ; i < len; i++) {
                        var li = '<li><span>' + data.data[i].ZScPlanBiaoID + '</span><span>' + data.data[i].SubState + '</span><span>' + data.data[i].GYState + '</span><span>' + data.data[i].BiaoState + '</span><span>' + data.data[i].ZbDate + '</span><span>' + data.data[i].ShDate + '</span></li>';
                        arrlist[i] = li;
                    }
                } else {//长度为0，则为"暂无更多"
                    arrlist[0] = '<li class="no-more">暂无更多</li>'
                }
                break;
            case 'year-select':
                for (var i = 0 ; i < len ; i++) {
                    arrlist[len - i] = '<option value=' + data.data[i].year + '>' + data.data[i].year; +'</option>';
                }
                year = data.data[len-1].year;
                break;
            case 'pmsub-list-content':
                if (len != 0) {
                    arrPmSubName.splice(0, arrPmSubName.length); //数组清空
                    for (var i = 0 ; i < len; i++) {
                        var li = '<li class="pmsub"><span>'+data.data[i].FScPlanBiaoID+'</span><span>'+data.data[i].ProductType+'</span><span>'+data.data[i].WorkShop+'</span><span>' + data.data[i].BiaoState + '</span><span>'+data.data[i].ZbDate+'</span><span>'+data.data[i].ShDate+'</span></li>';
                        arrlist[i] = li;
                        arrPmSubName[i] ='生产' + data.data[i].FScPlanBiaoID; //在这里拿到生产子计划的 计划号
                    }
                } else {
                    arrlist[0] = '<li class="no-more">暂无更多</li>';
                    arrPmSubName.splice(0, arrPmSubName.length); //数组清空
                }
                set_pmOnOff_value(true, getlistdata);
                break;
            case 'tmsub-list-content':
                if (len != 0) {
                    arrTmSubName.splice(0, arrTmSubName.length); //数组清空
                    for (var i = 0 ; i < len; i++) {
                        var li = '<li class="tmsub"><span>' + data.data[i].FScPlanBiaoID + '</span><span>' + data.data[i].ProductType + '</span><span>' + data.data[i].WorkShop + '</span><span>' + data.data[i].BiaoState + '</span><span>' + data.data[i].ZbDate + '</span><span>' + data.data[i].Linker + '</span></li>';
                        arrlist[i] = li;
                        arrTmSubName[i] ='工艺' + data.data[i].FScPlanBiaoID; //在这里拿到工艺子计划的 计划号
                    }
                } else {
                    arrlist[0] = '<li class="no-more">暂无更多</li>';
                    arrTmSubName.splice(0, arrTmSubName.length); //数组清空
                }
                set_tmOnOff_value(true, getlistdata);
                break;
        }
        $('#' + listID).html(arrlist.join('')); //填充表格数据*/
    }

    /*列表样式切换*/
    function changeOption(listID) {
        $('#' + listID).delegate('li', 'click', function () {
            $(this).parent().find('li').removeClass('click');
            $(this).addClass('click');
        })
    }

    /*隐藏 or 显示 数据*/
    function listAnimate(listID) {
        $('#' + listID).delegate('li', 'click', function () {
            //这部分是用来获取点选的主计划表的主计划号 ID
            if (($(this).html() != "展示全部")) {//点击的列表不为 "暂无更多"或者"正在加载"或者"查看更多"
                switch (listID) {
                    case 'mp-list-content':
                        mpID = $(this).children('span').eq(0).html();
                        $('#subplan').find('.list-title').children().find('span').eq(1).html(mpID);
                        $('#tm-subplan').find('.list-title').children().find('span').eq(1).html(mpID);
                        $('#mp-chart').find('.list-title').children().find('span').eq(1).html(mpID);
                        getData(loadPMSubPlanData(mpID), 'pmsub-list-content');
                        getData(loadTMSubPlanData(mpID), 'tmsub-list-content');

                        break;
                    
                }
            }
            if (onOff) {
                that = this;
                    $('#' + listID).stop().animate(
                        { height: "80" },
                        {
                            duration: 500, //动画时长500ms
                            easing: 'swing', //动画曲线 快->慢
                            done: function () {
                                var arrList = (document.getElementById(listID)).innerHTML;
                                $('#' + listID).html(('<li class="click">' + that.innerHTML + '</li>' + '<li class="show-all">展示全部</li>'));
                                onOff = false;
                                    $('#' + listID).delegate('li.show-all', 'click', function () {
                                        $('#' + listID).html(arrList);
                                        $('#' + listID).css('height', '400');
                                        onOff = true;
                                    })
                            }
                    })
            }
        })
    }
    //年份切换
    function yearSelect() {
        $('#year-select').change(function () {
            year = ($(this).find('option:selected').val());
            getData(initMainPlanData(year), 'mp-list-content');
            $('#mp-list-content').css('height', '400');
            onOff = true; //高度重新变为 400px
        })
    }

    //监听 pmOnOff tmOnOff  获取列表内容
    var getlistdata = function() {
        if (pmOnOff && tmOnOff) { //列表加载完成后
            
            for (var key in dataSankey) {
                delete dataSankey[key];
            }
            dataSankey = {
                "nodes": [],
                "links": []
            }
            var PMisRepeat = false,
                TMisRepeat = false;
            //生产子计划
            lenTmSub = arrTmSubName.length;
            TMisRepeat = IsRepeat(arrTmSubName); 

            //工艺子计划
            lenPmSub = arrPmSubName.length;
            PMisRepeat = IsRepeat(arrPmSubName); 

            if (PMisRepeat || TMisRepeat) {
                tmOnOff = false;
                pmOnOff = false;
                $('#mp-chart').css('display', 'none');
                return 1;
            }
            if( lenTmSub != 0 && lenPmSub != 0){
                $('#mp-chart').css('display', 'block');
                dataSankey.nodes.push(
                    { "name": mpID,       "value": lenPmSub + lenTmSub },
                    { "name": "生产子计划", "value": lenPmSub },
                    { "name": "工艺子计划", "value": lenTmSub }
                );
                dataSankey.links.push(
                    { "source": mpID, "target": "生产子计划", "value": lenPmSub }
                );
                for (var i = 0 ; i < lenPmSub ; i++) {
                    dataSankey.nodes.push(
                        {
                            "name": arrPmSubName[i],
                            "value": 1
                        }
                    );
                    dataSankey.links.push(
                        {
                            "source": "生产子计划",
                            "target": arrPmSubName[i],
                            "value": 1
                        }
                    );
                }
                dataSankey.links.push(
                    { "source": mpID, "target": "工艺子计划", "value":  lenTmSub }
                );
                for (var i = 0 ; i < lenTmSub ; i++) {
                    dataSankey.nodes.push(
                        {
                            "name": arrTmSubName[i],
                            "value": 1
                        }
                    );
                    dataSankey.links.push(
                        {
                            "source": "工艺子计划",
                            "target": arrTmSubName[i],
                            "value": 1
                        }
                    )
                }
            }

            if (lenTmSub == 0 && lenPmSub != 0) {
                $('#mp-chart').css('display', 'block');
                dataSankey.nodes.push(
                    { "name": mpID, "value": lenPmSub},
                    { "name": "生产子计划", "value": lenPmSub }
                );
                dataSankey.links.push(
                    { "source": mpID, "target": "生产子计划", "value": lenPmSub }
                );
                for (var i = 0 ; i < lenPmSub ; i++) {
                    dataSankey.nodes.push(
                        {
                            "name": arrPmSubName[i],
                            "value": 1
                        }
                    );
                    dataSankey.links.push(
                        {
                            "source": "生产子计划",
                            "target": arrPmSubName[i],
                            "value": 1
                        }
                    );
                }
            }

            if (lenTmSub != 0 && lenPmSub == 0) {
                $('#mp-chart').css('display', 'block');
                dataSankey.nodes.push(
                    { "name": mpID, "value": lenTmSub },
                    { "name": "工艺子计划", "value": lenTmSub }
                );
                dataSankey.links.push(
                    { "source": mpID, "target": "工艺子计划", "value": lenTmSub }
                );
                for (var i = 0 ; i < lenTmSub ; i++) {
                    dataSankey.nodes.push(
                        {
                            "name": arrTmSubName[i],
                            "value": 1
                        }
                    );
                    dataSankey.links.push(
                        {
                            "source": "工艺子计划",
                            "target": arrTmSubName[i],
                            "value": 1
                        }
                    );
                }
            }

            if (lenTmSub == 0 && lenPmSub == 0) {
                $('#mp-chart').css('display', 'none');
                tmOnOff = false;
                pmOnOff = false;
                return 1;
            }
            myCharts.hideLoading();

            myCharts.setOption(option = {
                title: {
                    text: ''
                },
                tooltip: {
                    trigger: 'item',
                    triggerOn: 'mousemove'

                },
                series: [
                    {
                        type: 'sankey',
                        layout: 'none',
                        data: dataSankey.nodes,
                        links: dataSankey.links,
                        itemStyle: {
                            normal: {
                                borderWidth: 1,
                                borderColor: '#aaa'
                            }
                        },
                        lineStyle: {
                            normal: {
                                color: 'source',
                                curveness: 0.5
                            }
                        }
                    }
                ]
            });
            
            tmOnOff = false;
            pmOnOff = false;
        }
        
    }

    //判断数组中是否有重复元素 有重复元素则返回true ,没有则返回false
    function IsRepeat(arr) {
        var s = arr.join(",") + ",";
        for (var i = 0 ; i < arr.length ; i++) {
            if (s.replace(arr[i] + ",", "").indexOf(arr[i] + ",") > -1) {
                return true;
            }
        }
        return false;
    }

    //IE8支持map
    function supportMap() {
        if (!Array.prototype.map) {
            Array.prototype.map = function (callback, thisArg) {

                var T, A, k;

                if (this == null) {
                    throw new TypeError(" this is null or not defined");
                }
                var O = Object(this);
                var len = O.length >>> 0;
                if (Object.prototype.toString.call(callback) != "[object Function]") {
                    throw new TypeError(callback + " is not a function");
                }
                if (thisArg) {
                    T = thisArg;
                }
                A = new Array(len);
                k = 0;
                while (k < len) {
                    var kValue, mappedValue;
                    if (k in O) {
                        kValue = O[k];
                        mappedValue = callback.call(T, kValue, k, O);
                        A[k] = mappedValue;
                    }
                    k++;
                }
                return A;
            };
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