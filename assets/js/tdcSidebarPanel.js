/**
 * Sidebar Panel Generator
 * Created by ra on 5/5/2016.
 */


/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* tdcAdminSettings */

var tdcSidebarPanel = {};


(function () {
    'use strict';


    tdcSidebarPanel = {

        _defaultGroupName: 'General', // where to put params that don't have a group


        bind: function (model) {




            // model.attributes.attrs
            //var mappedShortCode = window.tdcAdminSettings.mappedShortcodes[model.attributes.attrs];


            // get the mapped shortcode for this model
            var mappedShortCode = window.tdcAdminSettings.mappedShortcodes[model.attributes.tag];



            // step 0 - delete the old panel. HTML + items
            tdcSidebarPanel._deletePanel();



            // step 1 - make the tabs
            var allGroupNames = [];
            for (var cnt = 0; cnt < mappedShortCode.params.length; cnt++) {
                var currentTabName = tdcSidebarPanel._defaultGroupName;
                if (!_.isEmpty(mappedShortCode.params[cnt].group)) {
                    currentTabName = mappedShortCode.params[cnt].group;
                }
                allGroupNames.push(currentTabName);
            }
            allGroupNames = _.uniq(allGroupNames); // make the tabs unique. First occurrence remains in the array.


            var buffy = '';









            // tabs - top
            buffy += '<div class="tdc-tabs">';
                for (cnt = 0; cnt < allGroupNames.length; cnt++) {
                    if (cnt === 0) {
                        buffy += '<a href="#" data-tab-id="td-tab-' + tdcUtil.makeSafeForCSS(allGroupNames[cnt]) + '" class="tdc-tab-active">' + allGroupNames[cnt] + '</a>';
                    } else {
                        buffy += '<a href="#" data-tab-id="td-tab-' + tdcUtil.makeSafeForCSS(allGroupNames[cnt]) + '">' + allGroupNames[cnt] + '</a>';
                    }

                }
            buffy += '</div>';


            // tabs - content
            buffy += '<div class="tdc-tab-content-wrap">';
                for (cnt = 0; cnt < allGroupNames.length; cnt++) {
                    if (cnt === 0) {
                        buffy += '<div class="tdc-tab-content tdc-tab-content-visible" id="td-tab-' + tdcUtil.makeSafeForCSS(allGroupNames[cnt]) + '">';
                    } else {
                        buffy += '<div class="tdc-tab-content" id="td-tab-' + tdcUtil.makeSafeForCSS(allGroupNames[cnt]) + '">';
                    }

                        // tab content
                        buffy += tdcSidebarPanel._bindGroupAndGetHtml(allGroupNames[cnt], mappedShortCode, model);


                    buffy += '</div>'; // close tab content wrap
                }
            buffy += '</div>';

            jQuery('.tdc-inspector .tdc-tabs-wrapper').html(buffy);



            // step 2 - distribute content to the tabs







            //console.log(buffy);

            //console.log(mappedShortCode);
        },



        _bindGroupAndGetHtml: function (groupName, mappedShortCode,  model) {
            var buffy = '';

            for (var cnt = 0; cnt < mappedShortCode.params.length; cnt++) {

                if (groupName === tdcSidebarPanel._defaultGroupName) { // default group, check for empty
                    if (_.isEmpty(mappedShortCode.params[cnt].group)) {
                        buffy += tdcSidebarPanel._bindParamAndGetHtml(mappedShortCode.params[cnt], model);
                    }
                } else { // all other groups, check by name
                    if (mappedShortCode.params[cnt].group === groupName) {
                        buffy += tdcSidebarPanel._bindParamAndGetHtml(mappedShortCode.params[cnt], model);
                    }
                }
            }
            return buffy;
        },


        _bindParamAndGetHtml: function (mappedParameter, model) {
            //console.log(model.attributes.attrs);


            switch(mappedParameter.type) {
                case 'colorpicker':
                    return tdcSidebarPanel.addColorpicker(mappedParameter, model);
                default:
                    return mappedParameter.param_name + ' - ' + mappedParameter.type + '<br>';
            }


            //console .log(mappedParameter);
        },




        _deletePanel: function () {
            jQuery('.tdc-inspector .tdc-tabs-wrapper').empty();
        },



        _getCurrentValue: function () {

        },



        addColorpicker: function (mappedParameter, model) {
            console.log(mappedParameter);
            console.log(model);
            var buffy = '';
            var colorPickerId = _.uniqueId();

            buffy += '<div class="tdc-property-wrap tdc-property-colorpicker">';
            buffy += '<div class="tdc-property-title">My colorpicker:</div>';
            buffy += '<div class="tdc-property">';
            buffy += '<input id="' + colorPickerId + '" name="my_name" type="text" value="#dd3333"/>';
            buffy += '</div>';
            buffy += '</div>';


            setTimeout(function() {
                jQuery("#" + colorPickerId).cs_wpColorPicker();
            }, 1000);



            return buffy;


        },




        addTextArea: function () {

        },

        addTextField: function () {

        },
        addDropdown: function () {

        },

        addTextAreaHtml: function () {

        },

        addCssEditor: function () {

        }


    };

})();