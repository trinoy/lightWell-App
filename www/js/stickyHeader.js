angular.module('bgw')
  .directive('sticky', function($ionicScrollDelegate) {
    var options,
      defaults = {
        classes: {
          animated: 'item-animated',
          container: 'item-wrapper',
          hidden: 'item-hidden',
          stationaryHeader: 'item item-divider'
        },
        selectors: {
          groupContainer: 'item-container',
          groupHeader: 'item-divider',
          stationaryHeader: 'div'
        }
      };
    return {
      restrict: 'A',
      link: function(scope, element, attrs, ctrl) {

        var items = [],
          options = angular.extend(defaults, attrs),
          $element = angular.element(element),
          $fakeHeader = angular.element('<div class="' + options.classes.stationaryHeader + '"/>'),
          $groupContainer = angular.element($element[0].getElementsByClassName(options.selectors.groupContainer));

        $element.addClass('list-sticky');

        angular.element($element[0].getElementsByClassName('list')).addClass(options.classes.container);

        $element.prepend($fakeHeader);

        angular.forEach($groupContainer, function(elem, index) {

          var $tmp_list = $groupContainer.eq(index);
          $tmp_header = angular.element($tmp_list[0].getElementsByClassName(options.selectors.groupHeader)).eq(0),
            $tmp_listHeight = $tmp_list.prop('offsetHeight'),
            $tmp_listOffset = $tmp_list[0].getBoundingClientRect().top ;

          items.push({
            'list': $tmp_list,
            'header': $tmp_header,
            'listHeight': $tmp_listHeight,
            'headerText': $tmp_header.text(),
            'headerHeight': $tmp_header.prop('offsetHeight'),
            'listOffset': $tmp_listOffset,
            'listBottom': $tmp_listHeight + $tmp_listOffset
          });
        });

        $fakeHeader.text(items[0].headerText);

        scope.checkPosition = function() {
          var i = 0,
            topElement, offscreenElement, topElementBottom,
            currentTop = $ionicScrollDelegate.$getByHandle('scrollHandle').getScrollPosition().top;

          while ((items[i].listOffset - currentTop) <= 0) {
            topElement = items[i];
            topElementBottom = -(topElement.listBottom - currentTop);

            if (topElementBottom < -topElement.headerHeight) {
              offscreenElement = topElement;
            }

            i++;

            if (i >= items.length) {
              break;
            }
          }


          if (topElement) {

            if (topElementBottom < 0 && topElementBottom > -topElement.headerHeight) {
              $fakeHeader.addClass(options.classes.hidden);
              angular.element(topElement.list).addClass(options.classes.animated);
            } else {
              $fakeHeader.removeClass(options.classes.hidden);
              if (topElement) {
                angular.element(topElement.list).removeClass(options.classes.animated);
              }
            }
            $fakeHeader.text(topElement.headerText);
          }
        }
      }

    }
  });

