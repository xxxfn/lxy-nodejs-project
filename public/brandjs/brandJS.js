
var  page = 1; // 页码，通过查询串方式传递过来（?号后面的内容）
var  pageSize = 3; // 每页显示的条数/

function addall() {  
    $.get('/brand/addall',{
        page: page,
        pageSize: pageSize
    },function (result) {
        var array = result.userList;
        var str = '' ;
        for (let i = 0; i < array.length; i++) {
            str+=`
                <tr>
                    <td>${ i + 1 }</td>
                    <td><img src="${ array[i].brandurl }"></img> </td>           
                    <td>${array[i].brandname }</td>           
                    <td >
                        <button class='amend' name='${array[i].brandname}' >修改</button>
                        <button class='delete' name='${array[i].brandname}'>删除</button>
                    </td>           
                </tr>
            `    
        }
        $('#table').html(str);
        var page = '';
        for (let i = 0; i < parseInt(result.totalPage); i++) {
            page +=`
                <button num='${i+1}'>第${i+1}页</button>
            `
        }
        $('#page').html(page);

    })   
}

$(function () {
    addall();
    //让新增手机输入框出现
    $('.addmobile').click(function (params) {
        $('#addform').slideDown();
    })
    //新增手机
    $('.btn-default').click(function () {
          var formdata = new FormData();
        formdata.append('brandname', $('#randname').val());
        formdata.append('brandimg', $('#brandimg')[0].files[0]);
        $.ajax({
            url: '/brand/brandadd',
            method: 'post',
            data:formdata,
            contentType: false,
            processData: false,
            success: function (result) {
                if (result.code === 0) {
                    alert('添加成功');
                    $("#addform").slideUp();
                    addall();
                }
            },
            error: function (result) {
                console.log('添加失败，等下再添加');
                alert('输入不规范，请重新添加');
                $("#addform").slideUp();
            }
        })    
    })
    // 点击取消让新增 框消失
    $('.addnone').click(function () {
        $("#addform").slideUp();        
    })

    //点击翻页
    $('#page').on('click','button',function (params) {
        page = $(this).attr('num');
        addall();
    })

    //点击出现修改框
    $('#table').on('click','.amend',function (params) {
        $('.mobilename').val($(this).attr('name'));
        $('#brandchange').slideDown();
    })
    //点击修改
    $('.xiugaidiv').on('click', '.submit', function (params) {
        var formdata = new FormData();
        formdata.append('brandname', $('.mobilename').val());
        formdata.append('brandimg', $('#amendurl')[0].files[0]);
        $.ajax({
            url: '/brand/amend',
            method: 'post',
            data: formdata,
            contentType: false,
            processData: false,
            success: function (result) {
                if (result.code === 0) {
                    alert('修改成功');
                    $("#brandchange").slideUp();
                    addall();
                }
            },
            error: function (result) {
                console.log('添加失败，等下再修改');
                alert('输入不规范，请重新修改');
                $("#brandchange").slideUp();
            }
        })    
    })

    $('.xiugaidiv').on('click', '.cancel', function (params) {
        $('#brandchange').slideUp();
    })

    //点击删除
    $('#table').on('click', '.delete', function (params) {
        // alert('1232123');
        var brandname = $(this).attr('name');
        $.get('/brand/delete', {
            brandname: brandname
        }, function (result) {
            console.log(result.code,'删除了');
            addall();
        })

    })

})
