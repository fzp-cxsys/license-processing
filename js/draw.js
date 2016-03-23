//canvas元素的id
var canvasID = "demoCanvas";
/**
 * 整个脚本的初始化操作
 */
function init() {
	var stage = new createjs.Stage(canvasID);
			
	// this lets our drag continue to track the mouse even when it leaves the canvas:
	// play with commenting this out to see the difference.
	stage.mouseMoveOutside = true;
    stage.enableMouseOver(10);

    var img = addCarImg(stage, "img/img200706080802251506.jpg");
	var license = addLicense(stage, "AD1111");
	
	stage.update();

	// 裁剪框范围
	var cutPoints = null;

	// 添加裁剪框
	$("#cut-start").click(function(){
		if(img.sourceRect === null && cutPoints === null){
			cutPoints = addCutFrame(stage, 100, 100);
		}
	});

	// 取消裁剪框
	$("#cut-cancel").click(function(){
		if (cutPoints != null) {
			stage.removeChild(cutPoints[0].parent);
			cutPoints = null;
			stage.update();
		}
	});

	// 确认裁剪
	$("#cut-confirm").click(function(){
		if (img.sourceRect === null && cutPoints != null) {
			stage.removeChild(cutPoints[0].parent);
			cutImg(img, cutPoints[0].x, cutPoints[6].y, cutPoints[4].x - cutPoints[0].x, cutPoints[2].y - cutPoints[6].y);
			cutPoints = null;
		}
	});

	// 撤销裁剪
	$("#cut-repeal").click(function(){
		if (img.sourceRect != null) {
			repealCut(stage, img);
		}
	});

	//图片输出
	$("#output").click(function(){
		$(".op img").attr("src", stage.toDataURL("#DDDDDD"));
        $(".op p").append(stage.toDataURL("#DDDDDD"));
	})

	// 设置缩放监听
	$("#minify").click(function(){
		scale(license, -0.2);
		stage.update();
	});
	$("#magnify").click(function(){
		scale(license, 0.2);
		stage.update();
	});
	// 设置旋转监听
	$("#cwr").click(function(){
		rotate(license, 5);
		stage.update();
	});
	$("#ccwr").click(function(){
		rotate(license, -5);
		stage.update();
	});
	// 设置倾斜监听
	$("#skewL").click(function(){
		skew(license, -5);
		stage.update();
	});
	$("#skewR").click(function(){
		skew(license, 5);
		stage.update();
	});
}

/**
 * 在画布中添加一个车牌照
 * @param stage 画布容器
 * @param idNum 牌照内的内容文本即车牌号
 * @param lw 牌照初始宽度
 * @param lh 牌照初始高度
 * @returns {Container}license组件对象，将处理好的牌照组件对象返回
 */
function addLicense(stage, idNum, lw, lh){
	// 设置默认值
	lw = lw || 100;
	lh = lh || 50;
	// 取画布的宽高
    var canvas = $("#" + canvasID);
	var sw = canvas.width();
	var sh = canvas.height();
	// 创建牌照框
	var frame = new createjs.Shape();
	frame.graphics.beginStroke("red").setStrokeStyle(3).beginFill("green").drawRect(0, 0, lw, lh);
	// 创建牌照id
	var num = new createjs.Text(idNum, "bold 25px Arial", "black");
	num.textAlign = "center";
	num.x = lw / 2;
	num.y = lh * 0.3;
	// 牌照容器
	var license = new createjs.Container();
	// 设置位置和注册点
	license.x = sw / 2;
	license.y = sh / 2;
	license.regX = lw / 2;
	license.regY = lh / 2;
	license.skewY  = 0;
	license.rotation = 0;
	license.addChild(frame, num);
	// 设置拖动
	license.on("pressmove", function(e){drag(e);});
    license.cursor = "move";

	//牌照组件的名字为"license"
    license.name = "license";
	stage.addChild(license);
    stage.update();

	return license;
}

/**
 * 在画布中添加车辆图片
 * @param stage 画布容器
 * @param uri 车辆图片uri,支持base64码
 * @returns {Bitmap}处理好的车辆图片对象
 */
function addCarImg(stage, uri){
	// 加载图片
	var img = new createjs.Bitmap(uri);
	var bound = img.getBounds();

	//车辆图片组件的名字为"carImg"
	img.name = "carImg";
	stage.addChild(img);
    stage.update();

	return img;
}

/**
 * 添加用于裁剪车辆图片的裁剪框
 * @param stage 画布容器
 * @param width 初始裁剪框宽度
 * @param height 初始裁剪框高度
 * @returns {Array}返回裁剪框的控制点，以确定裁剪范围
 */
function addCutFrame(stage, width, height){
    // 取画布的宽高
    var canvas = $("#" + canvasID);
    var sw = canvas.width();
    var sh = canvas.height();
	// 裁剪框边框
	var cutRect = new createjs.Shape();
	cutRect.graphics.beginStroke("red").setStrokeStyle(2).drawRect(0, 0, width, height);
    cutRect.x = (sw - width) / 2;
    cutRect.y = (sh - height) / 2;
    //不需要把注册点放在中心
    //cutRect.regX = width / 2;
    //cutRect.regY = height / 2;
    cutRect.cursor = "move";
	cutRect.name = "rect";

	// 裁剪框控制点，将通过控制点来标识裁剪范围
    var cPoints = [];
	for(var i = 0; i < 8; i++){
        var cutPoint = new createjs.Shape();
        cutPoint.graphics.beginStroke("red").setStrokeStyle(1).beginFill("gray").drawCircle(0, 0, 3);
        cutPoint.name = "cutPoint" + i;
		cPoints.push(cutPoint);
	}
    /**
     * 四个边的控制点
     * 从左边的控制点开始
     * 逆时针顺序
     * 控制点索引分别为0,2,4,6
     */
    cPoints[0].x = (sw - width) / 2;
    cPoints[0].y = sh / 2;
    cPoints[4].x = (sw + width) / 2;
    cPoints[4].y = sh / 2;
    cPoints[2].x = sw / 2;
    cPoints[2].y = (sh + height) / 2;
    cPoints[6].x = sw / 2;
    cPoints[6].y = (sh - height) / 2;

    // 可横向拖动的控制点
    cPoints[0].on("pressmove", function(e){horizontalDrag(e);});
    cPoints[4].on("pressmove", function(e){horizontalDrag(e);});
    cPoints[0].cursor = "e-resize";
    cPoints[4].cursor = "e-resize";

    // 可纵向拖动的控制点
    cPoints[2].on("pressmove", function(e){verticalDrag(e);});
    cPoints[6].on("pressmove", function(e){verticalDrag(e);});
    cPoints[2].cursor = "n-resize";
    cPoints[6].cursor = "n-resize";

    /**
     * 四个角的控制点
     * 从左下角控制点开始
     * 逆时针顺序
     * 控制点索引分别为1,3,5,7
     */
    cPoints[1].x = (sw - width) / 2;
    cPoints[1].y = (sh + height) / 2;
    cPoints[3].x = (sw + width) / 2;
    cPoints[3].y = (sh + height) / 2;
    cPoints[5].x = (sw + width) / 2;
    cPoints[5].y = (sh - height) / 2;
    cPoints[7].x = (sw - width) / 2;
    cPoints[7].y = (sh - height) / 2;

    // 可拖动
    for(var i = 1; i < 8; i += 2){
        cPoints[i].on("pressmove", function(e){cornerDrag(e);});
    }
    cPoints[1].cursor = "sw-resize";
    cPoints[3].cursor = "se-resize";
    cPoints[5].cursor = "ne-resize";
    cPoints[7].cursor = "nw-resize";

    // 裁剪框
	var cutFrame = new createjs.Container();
	// 添加边框
	cutFrame.addChild(cutRect);
	// 添加控制点
	for(var i in cPoints){
		cutFrame.addChild(cPoints[i]);
	}
	cutFrame.name = "cutFrame";

    // 可拖动的裁剪框
    frameDrag(cutFrame);

	stage.addChild(cutFrame);
	stage.update();
	// 需要返回控制点数组，用以表示裁剪范围
	return cPoints;
}