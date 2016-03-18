function helper_generatePhotoPath( file_name, size ){
    if(file_name){
        var base_url = 'http://localhost:8888/imgs/';
        if (size)
        {
            size = '_' + size;
        }
        else
        {
            size = '';
        }
        path = file_name.charAt(0) + '/' + file_name.charAt(1) + '/' + file_name.charAt(2) + '/' + file_name.charAt(3) + '/' + file_name.charAt(4) + '/';
        var temp = file_name.split('.');
        var file_name_without_ext = temp[0];
        var file_ext = temp[1];
        return base_url + path + file_name_without_ext + size + '.' + file_ext;
    }
    else{
        return '/img/placeholder.png';
    }
}
