(function ($) {

//==================================================[localStorage 补缺]

// xxxx
  /*
   * 为不支持 localStorage 的浏览器（IE6 IE7）模拟此特性。
   *
   * 补缺方法：
   *   localStorage.getItem
   *   localStorage.setItem
   *   localStorage.removeItem
   *   localStorage.clear
   *
   * 注意：
   *   本实现并未模拟 localStorage.length 和 localStorage.key，因为它们并不常用。
   *   若要进行模拟，需要在每次操作更新一个列表，为严格保证列表的数据不被覆盖，还需要将数据存入另一个 xml 文档。
   *
   * 参考：
   *   https://github.com/marcuswestin/store.js
   *   http://msdn.microsoft.com/en-us/library/ms531424(v=vs.85).aspx
   */
//
  var ls = null, isWin8Ie10=null;
  try {
    ls = window.localStorage;
  } catch (e) {
    isWin8Ie10 = e.number; //win8 ie10 安全限制，默认安全级别不能直接访问 localStorage
  }
  if (ls) {
    $.localStorage = ls;
    return;
  } else if (isWin8Ie10 != null) {
    //todo use $.cookie
    $.localStorage = {};
//    $.localStorage.getItem = function (key) {
//      return $.cookie(key);
//    };
//    $.localStorage.setItem = function (key, value) {
//      return $.cookie(key, value, {expires: 2000, path: "/" });
//    };

      require.async("localstorage",function(){
          var flashCookie=$.hao123.storage.getInstance();
          $.localStorage.getItem = function (key) {
              return flashCookie.storage('val',key);
          };
          $.localStorage.setItem = function (key,val) {
              return flashCookie.storage('val',key,val);
          };
      });
    return;
  }


//  if (localStorage || !document.documentElement.addBehavior || location.protocol === 'file:') {
//    return;
//  }


  /**
   * 为不支持 localStorage 的浏览器提供类似的功能。
   * @name localStorage
   * @namespace
   * @description
   *   在不支持 localStorage 的浏览器中，会使用路径 '/favicon.ico' 来创建启用 userData 的元素。应保证上述路径存在，以免出现预料外的异常。
   *   userData 的尺寸限制为每文件 128KB，每域 1024KB；受限站点每文件 64KB，每域 640KB。
   */
  ls = {};

  // 指定一个固定的 userData 存储文件名。
  var STORE_NAME = 'local_storage';

  // 用来保存 userData 的元素。
  var storeElement;

  // 在当前域的根路径创建一个文档，并在此文档中创建用来保存 userData 的元素。
  try {
    // 使用这种方式（而不是在当前文档内直接插入 IFRAME 元素）可以避免在 IE6 的应用代码中调用 document.write 时出现“已终止操作”的异常。
    var storeContainerDocument = new ActiveXObject('htmlfile');
    storeContainerDocument.open();
    storeContainerDocument.write('<iframe id="store" src="/favicon.ico"></iframe>');
    storeContainerDocument.close();
    // IE6 IE7 IE8 允许在 document 上插入元素，可以确保代码的同步执行。
    var storeDocument = storeContainerDocument.getElementById('store').contentWindow.document;
    storeElement = storeDocument.appendChild(storeDocument.createElement('var'));
  } catch (e) {
    // 若创建失败，则仅实现不能跨路径的 userData 访问。
    storeElement = document.documentElement;
  }
  // 添加行为。
  storeElement.addBehavior('#default#userData');
//--------------------------------------------------[localStorage.getItem]
  /**
   * 从 localStorage 中读取一条数据。
   * @name localStorage.getItem
   * @function
   * @param {string} key 数据名。
   * @returns {?string} 数据值。
   *   如果指定的数据名不存在，返回 null。
   */
  ls.getItem = function (key) {
    storeElement.load(STORE_NAME);
    return storeElement.getAttribute(key);
  };

//--------------------------------------------------[localStorage.setItem]
  /**
   * 在 localStorage 中保存一条数据。
   * @name localStorage.setItem
   * @function
   * @param {string} key 数据名，不能为空字符串。
   * @param {string} value 数据值。
   * @description
   *   注意：与原生的 localStorage 不同，IE6 IE7 的实现不允许 `~!@#$%^&*() 等符号出现在 key 中，可以使用 . 和 _ 符号，但不能以 . 和数字开头。
   */
  ls.setItem = function (key, value) {
    storeElement.load(STORE_NAME);
    storeElement.setAttribute(key, value);
    storeElement.save(STORE_NAME);
  };

//--------------------------------------------------[localStorage.removeItem]
  /**
   * 从 localStorage 中删除一条数据。
   * @name localStorage.removeItem
   * @function
   * @param {string} key 数据名。
   */
  ls.removeItem = function (key) {
    storeElement.load(STORE_NAME);
    storeElement.removeAttribute(key);
    storeElement.save(STORE_NAME);
  };

//--------------------------------------------------[localStorage.clear]
  /**
   * 清空 localStorage 中的所有数据。
   * @name localStorage.clear
   * @function
   */
  ls.clear = function () {
    var attributes = storeElement.XMLDocument.documentElement.attributes;
    storeElement.load(STORE_NAME);
    for (var i = 0, len = attributes.length; i < len; i++) {
      var attr = attributes[i];
      storeElement.removeAttribute(attr.name);
    }
    storeElement.save(STORE_NAME);
  };

  $.localStorage = ls;
})(jQuery);
