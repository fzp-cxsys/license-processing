/**
 * 用于图片和牌照的拖动
 * @param evt
 */
function drag(evt) {
    var target = evt.currentTarget;
    // 更改位置坐标
    target.x = evt.stageX;
    target.y = evt.stageY;
    // 更新舞台以显示
    target.stage.update();
}

/**
 * 用于裁剪框的横向控制点的拖动
 * @param evt
 */
function horizontalDrag(evt){
    var target = evt.currentTarget;
    // 更改位置坐标
    target.x = evt.stageX;
    //更新裁剪框
    updateCutFrame(target.parent);
    // 更新舞台以显示
    target.stage.update();
}

/**
 * 用于裁剪框的纵向控制点的拖动
 * @param evt
 */
function verticalDrag(evt){
    var target = evt.currentTarget;
    // 更改位置坐标
    target.y = evt.stageY;
    //更新裁剪框
    updateCutFrame(target.parent);
    // 更新舞台以显示
    target.stage.update();
}

/**
 * 用于裁剪框的四角控制点的拖动
 * @param evt
 */
function cornerDrag(evt){
    var target = evt.currentTarget;
    // 更改自身位置坐标
    target.y = evt.stageY;
    target.x = evt.stageX;
    var frame = target.parent;
    // 更改相邻控制点的位置以标识矩形的变化
    switch(target.name){
        case "cutPoint1":{
            frame.getChildByName("cutPoint0").x = target.x;
            frame.getChildByName("cutPoint2").y = target.y;
            break;
        }
        case "cutPoint3":{
            frame.getChildByName("cutPoint4").x = target.x;
            frame.getChildByName("cutPoint2").y = target.y;
            break;
        }
        case "cutPoint5":{
            frame.getChildByName("cutPoint4").x = target.x;
            frame.getChildByName("cutPoint6").y = target.y;
            break;
        }
        case "cutPoint7":{
            frame.getChildByName("cutPoint0").x = target.x;
            frame.getChildByName("cutPoint6").y = target.y;
            break;
        }
    }
    //更新裁剪框
    updateCutFrame(target.parent);
    // 更新舞台以显示
    target.stage.update();
}

/**
 * 用于拖动裁剪框
 * @param frame 裁剪框对象
 */
function frameDrag(frame){
    var rect = frame.getChildByName("rect");
    rect.on("mousedown",function(evt){
        frame.offset = {x: rect.x - evt.stageX, y: rect.y - evt.stageY};
    });
    rect.on("pressmove",function(evt){
        //移动边框
        var oldX = rect.x;
        var oldY = rect.y;
        rect.x = evt.stageX + frame.offset.x;
        rect.y = evt.stageY + frame.offset.y;
        //移动控制点
        var fc = frame.children;
        for(var i in fc){
            if(fc[i].name != "rect"){
                fc[i].x += rect.x - oldX;
                fc[i].y += rect.y - oldY;
            }
        }
        frame.stage.update();
    });
}

function updateCutFrame(cutFrame){
    //先获取控制点
    var cPoints = [];
    for(var i = 0; i < 8; i++){
        var cutPoint = cutFrame.getChildByName("cutPoint" + i);
        cPoints.push(cutPoint);
    }
    //再获取裁剪边框
    var rect = cutFrame.getChildByName("rect");
    //调整边框的大小和位置
    var x = cPoints[0].x;
    var y = cPoints[6].y;
    var width = cPoints[4].x - cPoints[0].x;
    var height = cPoints[2].y - cPoints[6].y;
    rect.graphics.clear().beginStroke("red").setStrokeStyle(2).drawRect(0, 0, width, height);
    rect.x = x;
    rect.y = y;
    //调整控制点位置
    cPoints[0].x = x;
    cPoints[0].y = y + height / 2;
    cPoints[4].x = x + width;
    cPoints[4].y = y + height / 2;
    cPoints[2].x = x + width / 2;
    cPoints[2].y = y + height;
    cPoints[6].x = x + width / 2;
    cPoints[6].y = y;

    cPoints[1].x = x;
    cPoints[1].y = y + height;
    cPoints[3].x = x + width;
    cPoints[3].y = y + height;
    cPoints[5].x = x + width;
    cPoints[5].y = y;
    cPoints[7].x = x;
    cPoints[7].y = y;
}

/**
 * 用于图片缩放
 * @param shap 图片对象
 * @param scale 缩放规模
 */
function scale(shap, scale){
    var s = shap.scaleX + scale;
    // 图形的规模限制在0.2--5之间
    s = s <= 4 ? s : 4;
    s = s >= 0.2 ? s : 0.2;

    shap.scaleX = s;
    shap.scaleY = s;
}

/**
 * 图片旋转
 * @param shap 图片对象
 * @param degree 旋转角度
 */
function rotate(shap, degree){
    shap.rotation += degree;
}

/**
 * 图片倾斜
 * @param shap 图片对象
 * @param skew 倾斜度
 */
function skew(shap, skew){
    shap.skewX += skew;
}

/**
 * 图片裁剪
 * @param img 图片对象
 * @param x 裁剪框位置x(相对于stage)
 * @param y 裁剪框位置y
 * @param width 裁剪框宽度
 * @param height 裁剪框高度
 */
function cutImg(img, x, y, width, height){
    // 创建裁剪范围
    var cutBound = new createjs.Rectangle(x, y, width, height);
    // 设置裁剪
    img.sourceRect = cutBound;
    img.x = x;
    img.y = y;
    img.stage.update();
}

/**
 * 撤销裁剪操作
 * @param stage
 * @param img
 */
function repealCut(stage, img){
    // 撤销裁剪
    img.sourceRect = null;
    img.x = 0;
    img.y = 0;
    stage.update();
}