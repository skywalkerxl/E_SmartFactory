$(function () {
    $(document).ready(init);

    //初始化权限码
    function init() {
        
        //选项点击触发
        $('li.opt-list').click(function () {
            var optText = $(this).find('span').html(); //获取选项标题

            switch (optText) {
                case '合同额统计':
                    window.location.href = "";
                    break;
                case '完成额统计':
                    window.location.href = "";
                    break;
                case '生产进度统计':
                    console.log(optText);
                    window.location.href = "";
                    break;
                case '图纸设计统计':
                    console.log(optText);
                    window.location.href = "";
                    break;
                case '工艺设计统计':
                    console.log(optText);
                    window.location.href = "";
                    break;
                case '车间任务统计':
                    console.log(optText);
                    window.location.href = "";
                    break;
                case '完成额统计':
                    console.log(optText);
                    window.location.href = "";
                    break;
                case '车间占用统计':
                    console.log(optText);
                    window.location.href = "";
                    break;
                case '采购量统计':
                    console.log(optText);
                    window.location.href = "";
                    break;
                default:
                    console.log('no else');
                    window.location.href = "";
            }
        });
    }

    

})