var mock = require("./course.mock.json");

// load q promise library
var q = require("q");

// pass db and mongoose reference to model
module.exports = function(db) {
    var mongoose = require("mongoose");
    var CourseSchema = require("./course.schema.server.js")(mongoose);
    var Course = mongoose.model("Course", CourseSchema);
    var courses = [];

    var api = {
        findAllCourses: findAllCourses,
        findCourseById: findCourseById,

        createCourse: createCourse,
        updateCourseById: updateCourseById,
        deleteCourseById: deleteCourseById,

        // SAVED COURSES
        favoriteCourse: favoriteCourse,
        findCoursesLikedByUser: findCoursesLikedByUser,

        // SEARCH
        searchCourseBySubject: searchCourseBySubject,
        searchCourseByTitle: searchCourseByTitle
    };
    return api;


    function findAllCourses() {
        // console.log("model find all courses");
        var deferred = q.defer();
        Course.find(
            function(err, courses) {
                if (!err) {
                    deferred.resolve(courses);
                } else {
                    deferred.reject(err);
                }
            }
        );
        return deferred.promise;
        // return Course.find();
    }

    function findCourseById(courseId) {
        // console.log("model find course by ID:", courseId);
        var deferred = q.defer();
        Course.findById(courseId,
            function(err, course) {
                if (!err) {
                    deferred.resolve(course);
                } else {
                    deferred.reject(err);
                }
            });
        return deferred.promise;
    }

    function createCourse(course) {
        var deferred = q.defer();
        Course.create(course,
            function(err, course) {
                if (!err) {
                    deferred.resolve(course);
                } else {
                    deferred.reject(err);
                }
            });
        return deferred.promise;
    }

    function updateCourseById(courseId, newCourse) {
        var deferred = q.defer();
        var newCourse = {
                "subject": newCourse.subject,
                "number": newCourse.number,
                "title": newCourse.title,
                "description": newCourse.description,
                "creditHours": newCourse.creditHours,
                "lectureHours": newCourse.lectureHours,
                "prereqs": newCourse.prereqs,
                "level": newCourse.level,
                "type": newCourse.type,
                "likes": [''],
                "userLikes": ['']
            }
            // console.log(newCourse);
        Course.findByIdAndUpdate(courseId, {
                $set: newCourse
            }, {
                new: true,
                upsert: true
            },
            function(err, stats) {
                if (!err) {
                    deferred.resolve(stats);
                } else {
                    deferred.reject(err);
                }
            }
        );
        return deferred.promise;
    }


    function deleteCourseById(courseId) {
        // console.log("model delete", courseId);
        var deferred = q.defer();
        Course
            .remove({
                    _id: courseId
                },
                function(err, stats) {
                    if (!err) {
                        deferred.resolve(stats);
                    } else {
                        deferred.reject(err);
                    }
                }
            );
        return deferred.promise;
    }


    function favoriteCourse(userId, course) {
        var deferred = q.defer();
        // console.log("course model fav");

        // find the course by imdb ID
        Course.findOne({
                _id: course._id
            },

            function(err, doc) {
                // reject promise if error
                if (err) {
                    deferred.reject(err);
                }
                // if there's a course
                if (doc) {
                    // add user to list of users who like course
                    doc.likes.push(userId);
                    // save changes
                    doc.save(function(err, doc) {
                        if (err) {
                            deferred.reject(err);
                        } else {
                            deferred.resolve(doc);
                        }
                    });
                } else {
                    // if there's no course, create a new instance
                    course = new Course({
                        subject: course.subject,
                        number: course.number,
                        title: course.title,
                        description: course.description,
                        creditHours: course.creditHours,
                        lectureHours: course.lectureHours,
                        prereqs: course.prereqs,
                        level: course.level,
                        type: course.type,
                        likes: []
                    });

                    // console.log("IN COURSE MODEL FAVORITE COURSE", course);

                    // add user to list of users who like course
                    course.likes.push(userId);

                    // save new instance
                    course.save(function(err, doc) {
                        if (err) {
                            deferred.reject(err);
                        } else {
                            deferred.resolve(doc);
                        }
                    });
                }
            });
        return deferred.promise;
    }

    ////////////////////////////////////////////////////

    function findCoursesLikedByUser(user) {
        var deferred = q.defer();
        console.log("course model findCoursesLikedByUser");

        // find all courses whose course IDs are in imdbIDs array
        Course.find({
            imdbID: {
                $in: likes // ?????????
            }
        }, function(err, movies) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(movies);
            }
        })
        return deferred.promise;
    }

    function findMoviesByImdbIDs(imdbIDs) {

        var deferred = q.defer();

        // find all movies
        // whose imdb IDs
        // are in imdbIDs array
        Movie.find({
            imdbID: {
                $in: imdbIDs
            }
        }, function(err, movies) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(movies);
            }
        })
        return deferred.promise;
    }

    ////////////////////////////////////////////////////

    function searchCourseBySubject(subject) {
        console.log('search by subject');
    }

    function searchCourseByTitle(title) {
        console.log('search by title');
    }


}
