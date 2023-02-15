package socialnet.mappers;

import socialnet.api.request.CommentRq;
import socialnet.api.response.CommentRs;
import socialnet.model.entities.Comment;
import socialnet.model.entities.Person;
import socialnet.model.entities.Post;
import socialnet.service.LikesService;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Mapper(componentModel = "spring", uses = {PersonMapper.class, LikesService.class}, imports = {LocalDateTime.class, ZoneId.class})
public interface CommentMapper {

    @Mapping(target = "parentId", source = "parentComment.id")
    @Mapping(target = "postId", source = "post.id")
    @Mapping(target = "embeddedComments" , ignore = true)
    @Mapping(target = "likes", source = "comment", qualifiedByName = "getLikesCount")
    @Mapping(target = "myLike", source = "comment", qualifiedByName = "getMyLike")
    CommentRs commentToResponse(Comment comment);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "time", expression = "java(LocalDateTime.now(ZoneId.of(\"Europe/Moscow\")))")
    @Mapping(target = "post", source = "post")
    @Mapping(target = "parentComment", source = "parentComment")
    @Mapping(target = "embeddedComments", ignore = true)
    @Mapping(target = "author", source = "person")
    @Mapping(target = "commentText", source = "request.commentText")
    @Mapping(target = "isBlocked", constant = "false")
    @Mapping(target = "isDeleted", constant = "false")
    Comment commentRequestToNewComment(CommentRq request, Post post, Person person, Comment parentComment);
}
