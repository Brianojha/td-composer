/**
 * Created by ra on 3/3/2016.
 * Send new jobs to the server. It provides two callbacks that allows the @tdcIFrameData to process the reply
 */


/* global jQuery:false */

var tdcJobManager = {};


(function () {
    'use strict';


    tdcJobManager = {



        /**
         * here we keep all the blockUid - to - jobNumber associations. We use them to discard older jobs and keep the latest ones
         * @todo - this variable is not cleaned, we just add to it with each job
         */
        _sentJobs: {},

        /**
         * used for assigning an incrementing ID to each job
         */
        totalJobsCount: 0,

        /**
         * @see tdcJobManager.addJob receives this job
         */
        job: function () {
            this.shortcode = '';
            this.columns = 0;
            this.blockUid = '';
            this.success_callback = '';
            this.error_callback = '';
        },


        /**
         * an instance of this class is sent to the server and the server will add the replyHtml and other needed keys
         * @param job
         */
        jobRequest: function(job) {

            // request - sent to the server
            this.shortcode = job.shortcode;
            this.columns = job.columns;
            this.jobId = tdcJobManager._generateJobId();
            this.postId = window.tdcPostSettings.postId;

            // reply - this will be added by the server when we get back the instance of this
            this.replyHtml = '';
        },






        /**
         * add a new job, your callback will be called when the job is ready
         * @param  job tdcJobManager.job()
         */
        addJob: function (job) {

            // Mark the content as modified
            tdcMain.setContentModified();

            tdcDebug.group('%c tdcJobManager.addJob', 'background-color:#2489c2; color:white');
            //console.log(job);

            var newJobRequest = new tdcJobManager.jobRequest(job);
            jQuery.ajax({
                timeout: 10000,
                type: 'POST',

                // the tmp_ query parameters and the uuid are for cache busting and for easier debug-ing. We ONLY USE post variables.
                url: tdcUtil.getRestEndPoint('td-composer/do_job', 'tmp_jobId=' + newJobRequest.jobId + '&tmp_blockUid=' + newJobRequest.blockUid + '&uuid=' + tdcJobManager._getUniqueID()),
                //url: window.tdcAdminSettings.site_url + '/wp-json/td-composer/do_job?tmp_jobId=' + newJobRequest.jobId + '&tmp_liveViewId=' + newJobRequest.liveViewId + '&uuid=' + tdcJobManager._getUniqueID(),
                // add the nonce used for cookie authentication
                beforeSend: function ( xhr ) {
                    xhr.setRequestHeader( 'X-WP-Nonce', window.tdcAdminSettings.wpRestNonce);
                },
                cache: false,
                data: newJobRequest,
                dataType: 'json',

                // callbacks for status codes errors, note that the error callback also fires when a strange status code is received
                statusCode: {
                    404 : function() {
                        console.log('tdcJobManager.addJob - ERROR: 404 not found');
                    },
                    500 : function() {
                        console.log('tdcJobManager.addJob - ERROR: 500 server error');
                    }
                },


                success: function(jobRequest, textStatus, XMLHttpRequest) {
                    // check for empty response. Empty response evaluates to null in json
                    if (jobRequest === null) {
                        job.error(newJobRequest, 'tdcJobManager.addJob - ERROR: Empty response received from server');
                        return;
                    }

                    if (tdcJobManager._isJobCallbackReplyValid(job.blockUid, jobRequest.jobId) === true) {

                        job.success_callback(jobRequest);
                    } else {
                        tdcDebug.log('tdcJobManager.addJob - dropped job :) (probably it\'s older than the last timestamp)');
                    }

                    tdcDebug.groupEnd();
                    //console.log();
                },

                // this callback is called when any error is encountered. (including status codes like 404, 500 etc)
                error: function(MLHttpRequest, textStatus, errorThrown){
                    job.error_callback(newJobRequest, 'tdcJobManager.addJob - Error callback - textStatus: ' + textStatus + ' errorThrown: ' + errorThrown);
                    tdcDebug.groupEnd();
                }
            });
        },


        /**
         * Checks if a reply is valid, for example if an older job was received for the same blockUid, we will discard this job because
         * it dosn't reflact the latest version of the block for this blockUid
         * @param blockUid
         * @param jobIdStamp
         * @returns {boolean}
         * @private
         */
        _isJobCallbackReplyValid: function (blockUid, jobIdStamp) {

            if (typeof tdcJobManager._sentJobs[blockUid] === 'undefined') {
                tdcJobManager._sentJobs[blockUid] = jobIdStamp;
                return true;
            }

            if (parseInt(tdcJobManager._sentJobs[blockUid]) < parseInt(jobIdStamp)) {
                tdcJobManager._sentJobs[blockUid] = jobIdStamp;
                return true;
            }

            return false;
        },


        /**
         *
         * @returns {number}
         * @private
         */
        _generateJobId: function () {
            var buffer = tdcJobManager.totalJobsCount;
            tdcJobManager.totalJobsCount++;
            return buffer;

        },


        /**
         * generates an unique ID. Used for cache busting
         * @returns {string}
         * @private
         */
        _getUniqueID: function() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        }
    };

})();



