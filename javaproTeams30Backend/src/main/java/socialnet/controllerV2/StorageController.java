//package socialnet.controllerV2;
//
//import io.swagger.v3.oas.annotations.tags.Tag;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.MediaType;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.RestController;
//import org.springframework.web.multipart.MultipartFile;
//import socialnet.aop.annotations.UpdateOnlineTime;
//import socialnet.api.response.CommonRs;
//import socialnet.api.response.StorageDataRs;
//import socialnet.errors.FileException;
//import socialnet.service.UsersService;
//
//import java.io.IOException;
//
//@RestController
//@RequestMapping("/api/v2")
//@RequiredArgsConstructor
//@Tag(name = "storage-controller", description = "Work with account image file")
//public class StorageController {
//
//    private final UsersService usersService;
//
//    @UpdateOnlineTime
//    @PostMapping(value = "/storage", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
//    public CommonRs<StorageDataRs> storage(@RequestParam(value = "file",required = false) MultipartFile photo) throws IOException, FileException {
//        return usersService.storeImage(photo);
//    }
//}
