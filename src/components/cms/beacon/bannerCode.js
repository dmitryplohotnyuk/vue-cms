import pickBy from 'lodash/pickBy'

export default function getBannerCode({ script_url, project_id, settings }, $t) {
    const defaultSettings = {
        text: '',
        bar_color: '#535353',
        text_color: '#C3C3C3',
        text_size: '1.7rem',
        button_text: $t('sign up'),
        webkit: false,
    }
    const initSettings = pickBy(settings, (value, key) => {
        return value !== defaultSettings[key]
    })
    const code = `(function(name,host,id,ctx){ctx[name]=ctx[name]||{ready:function(fn){var h=document.getElementsByTagName('head')[0],s=document.createElement('script'),w=window,loaded;s.onload=s.onerror=s.onreadystatechange=function(){if((s.readyState&&!(/^c|loade/.test(s.readyState)))||loaded){return}s.onload=s.onreadystatechange=null;loaded=1;ctx[name].ready(fn)};s.async=1;s.src=host+'/js?id='+id;h.parentNode.insertBefore(s,h)}}})
('aizu', '${script_url}', '${project_id}', this);
aizu.ready(function() {
aizu.init(${JSON.stringify(initSettings, null, 4)});
aizu.show();
});`
    return code
}
